@echo off
cd /d "%~dp0"
del /q main.aux main.log main.out main.toc main.lot main.lof main.bbl main.blg main.fls main.fdb_latexmk main.synctex.gz main.xdv 2>nul
echo Clean completed.
