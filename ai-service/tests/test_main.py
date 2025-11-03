from fastapi.testclient import TestClient

from app.main import app


def test_healthz():
    client = TestClient(app)
    response = client.get('/healthz')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_generate_placeholder():
    client = TestClient(app)
    payload = {
        'portrait_id': 'portrait-123',
        'wig_asset_url': 'https://cdn.example.com/wigs/demo.png',
        'favorite_id': 'fav-1',
    }
    response = client.post('/generate', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['output_url'].endswith('fav-1.jpg')
