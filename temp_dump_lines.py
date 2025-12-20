from pathlib import Path
path = Path('src/pages/customer/SearchResultsPage/SearchResultsPage.jsx')
with path.open() as f:
    for i,line in enumerate(f,1):
        if 90 <= i <= 200:
            print(f"{i}: {line.rstrip()}")
