import sys
import json
from pyotdr import sorparse

def parse_sor(filepath):
    status, results, tracedata_row_strs = sorparse(filepath)
    if status != 'ok':
        raise ValueError("Parsing failed: Invalid status")
    tracedata = [
        {"distance": float(row.split('\t')[0]), "signal": float(row.split('\t')[1])}
        for row in tracedata_row_strs
    ]
    return results, tracedata

if __name__ == '__main__':
    filepath = sys.argv[1]
    try:
        results, tracedata = parse_sor(filepath)
        print(json.dumps({"results": results, "tracedata": tracedata}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
