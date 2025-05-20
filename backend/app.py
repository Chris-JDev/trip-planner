from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import heapq

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

GOOGLE_API_KEY = "AIzaSyBulwcYEOzKkrMBvU56-vK7PtHT_Z-2jvY"  # <-- Set your key here

@app.route('/autocomplete')
def autocomplete():
    input_text = request.args.get('input')
    url = (
        f"https://maps.googleapis.com/maps/api/place/autocomplete/json"
        f"?input={input_text}&types=(cities)&key={GOOGLE_API_KEY}"
    )
    resp = requests.get(url).json()
    suggestions = [p['description'] for p in resp.get('predictions', [])]
    return jsonify(suggestions=suggestions)

@app.route('/geocode')
def geocode():
    address = request.args.get('address')
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
    resp = requests.get(url).json()
    if resp['status'] == "OK":
        loc = resp['results'][0]['geometry']['location']
        return jsonify(location=loc)
    else:
        return jsonify(error="Location not found"), 404

@app.route('/optimize_route', methods=['POST'])
def optimize_route():
    data = request.json
    locations = data.get('locations', [])
    coords = []
    for loc in locations:
        r = requests.get(f"http://127.0.0.1:5000/geocode?address={loc}").json()
        coords.append((r['location']['lat'], r['location']['lng']))
    n = len(coords)
    from itertools import permutations
    min_order = None
    min_dist = float("inf")
    def dist(p1, p2): return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5
    for perm in permutations(range(n)):
        total = sum(dist(coords[perm[i]], coords[perm[i+1]]) for i in range(n-1))
        if total < min_dist:
            min_dist = total
            min_order = perm
    ordered = [locations[i] for i in min_order]
    return jsonify(order=ordered, total_distance=min_dist)

if __name__ == '__main__':
    app.run(debug=True)
