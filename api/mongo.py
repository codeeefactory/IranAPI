from __future__ import annotations

import copy
import re
from collections import defaultdict
from typing import Any


_collections: dict[str, list[dict[str, Any]]] = defaultdict(list)
_counters: dict[str, int] = defaultdict(int)
_indexes_ready = False


class InsertOneResult:
    def __init__(self, inserted_id: Any):
        self.inserted_id = inserted_id


class InMemoryCursor:
    def __init__(self, documents: list[dict[str, Any]]):
        self.documents = documents

    def __iter__(self):
        return iter(self.documents)

    def sort(self, spec):
        sorted_docs = list(self.documents)
        for field, direction in reversed(list(spec)):
            sorted_docs.sort(key=lambda doc: _get(doc, field), reverse=direction < 0)
        return InMemoryCursor(sorted_docs)


class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name

    @property
    def documents(self) -> list[dict[str, Any]]:
        return _collections[self.name]

    def create_index(self, *args, **kwargs):
        return None

    def insert_one(self, document: dict[str, Any]) -> InsertOneResult:
        self.documents.append(copy.deepcopy(document))
        return InsertOneResult(document.get("_id"))

    def find_one(self, query: dict[str, Any] | None = None, projection: dict[str, Any] | None = None, **kwargs):
        documents = self.documents
        if kwargs.get("sort"):
            documents = list(InMemoryCursor([copy.deepcopy(doc) for doc in documents]).sort(kwargs["sort"]))
        for document in documents:
            if _matches(document, query or {}):
                return copy.deepcopy(_project(document, projection))
        return None

    def find(self, query: dict[str, Any] | None = None):
        return InMemoryCursor([copy.deepcopy(doc) for doc in self.documents if _matches(doc, query or {})])

    def count_documents(self, query: dict[str, Any] | None = None) -> int:
        return sum(1 for doc in self.documents if _matches(doc, query or {}))

    def update_one(self, query: dict[str, Any], update: dict[str, Any]):
        for document in self.documents:
            if not _matches(document, query):
                continue
            _apply_update(document, update)
            return None
        return None

    def update_many(self, query: dict[str, Any], update: dict[str, Any]):
        for document in self.documents:
            if _matches(document, query):
                _apply_update(document, update)
        return None

    def delete_one(self, query: dict[str, Any]):
        for index, document in enumerate(self.documents):
            if _matches(document, query):
                del self.documents[index]
                return None
        return None

    def delete_many(self, query: dict[str, Any] | None = None):
        self.documents[:] = [doc for doc in self.documents if not _matches(doc, query or {})]
        return None

    def aggregate(self, pipeline: list[dict[str, Any]]):
        docs = [copy.deepcopy(doc) for doc in self.documents]
        for stage in pipeline:
            if "$match" in stage:
                docs = [doc for doc in docs if _matches(doc, stage["$match"])]
            elif "$group" in stage:
                docs = _group(docs, stage["$group"])
        return docs


class InMemoryDatabase:
    def __getitem__(self, name: str) -> InMemoryCollection:
        return InMemoryCollection(name)


def get_client():
    return object()


def get_database():
    database = InMemoryDatabase()
    ensure_indexes(database)
    return database


def reset_database():
    _collections.clear()
    _counters.clear()


def next_id(collection_name: str) -> int:
    _counters[collection_name] += 1
    return _counters[collection_name]


def ensure_indexes(database=None):
    global _indexes_ready
    if _indexes_ready and database is None:
        return
    db = database if database is not None else get_database()
    for name in ("users", "categories", "apis", "sessions", "legacy_tokens"):
        db[name].create_index("_id")
    _indexes_ready = True


def _get(document: dict[str, Any], field: str):
    value: Any = document
    for part in field.split("."):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def _set(document: dict[str, Any], field: str, value: Any):
    target = document
    parts = field.split(".")
    for part in parts[:-1]:
        target = target.setdefault(part, {})
    target[parts[-1]] = value


def _unset(document: dict[str, Any], field: str):
    target = document
    parts = field.split(".")
    for part in parts[:-1]:
        target = target.get(part, {})
    if isinstance(target, dict):
        target.pop(parts[-1], None)


def _project(document: dict[str, Any], projection: dict[str, Any] | None):
    if not projection:
        return document
    if all(value for value in projection.values()):
        return {field: _get(document, field) for field in projection}
    return document


def _matches(document: dict[str, Any], query: dict[str, Any]) -> bool:
    for field, expected in query.items():
        if field == "$or":
            if not any(_matches(document, option) for option in expected):
                return False
            continue
        value = _get(document, field)
        if isinstance(expected, dict):
            if "$ne" in expected and value == expected["$ne"]:
                return False
            if "$in" in expected and value not in expected["$in"]:
                if not (isinstance(value, list) and any(item in expected["$in"] for item in value)):
                    return False
            if "$exists" in expected and ((_get(document, field) is not None) != bool(expected["$exists"])):
                return False
            if "$gt" in expected and not (value is not None and value > expected["$gt"]):
                return False
            if "$regex" in expected:
                flags = re.I if "i" in expected.get("$options", "") else 0
                if not re.search(expected["$regex"], str(value or ""), flags):
                    return False
        elif isinstance(value, list):
            if expected not in value:
                return False
        elif value != expected:
            return False
    return True


def _apply_update(document: dict[str, Any], update: dict[str, Any]):
    for field, value in update.get("$set", {}).items():
        _set(document, field, value)
    for field, value in update.get("$inc", {}).items():
        _set(document, field, (_get(document, field) or 0) + value)
    for field in update.get("$unset", {}):
        _unset(document, field)


def _group(documents: list[dict[str, Any]], spec: dict[str, Any]) -> list[dict[str, Any]]:
    groups: dict[Any, dict[str, Any]] = {}
    for document in documents:
        key_spec = spec["_id"]
        key = _get(document, key_spec[1:]) if isinstance(key_spec, str) and key_spec.startswith("$") else key_spec
        group = groups.setdefault(key, {"_id": key})
        for out_field, operation in spec.items():
            if out_field == "_id":
                continue
            if "$sum" in operation:
                operand = operation["$sum"]
                group[out_field] = group.get(out_field, 0) + (
                    _get(document, operand[1:]) if isinstance(operand, str) and operand.startswith("$") else operand
                )
            elif "$min" in operation:
                value = _get(document, operation["$min"][1:])
                group[out_field] = value if out_field not in group else min(group[out_field], value)
            elif "$avg" in operation:
                value = _get(document, operation["$avg"][1:]) or 0
                total_key = f"__{out_field}_total"
                count_key = f"__{out_field}_count"
                group[total_key] = group.get(total_key, 0) + value
                group[count_key] = group.get(count_key, 0) + 1
                group[out_field] = group[total_key] / group[count_key]
    for group in groups.values():
        for key in list(group):
            if key.startswith("__"):
                del group[key]
    return list(groups.values())
