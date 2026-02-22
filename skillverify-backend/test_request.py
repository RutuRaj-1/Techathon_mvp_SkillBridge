import urllib.request
import json
import urllib.error

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/github/analyze',
    data=json.dumps({'repo_url':'https://github.com/akhilesh-dct/E-commerce-billing'}).encode(),
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
