from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_saved_internships_without_token():

    response = client.get(
        "/saved-internships"
    )

    assert response.status_code in [
        401,
        403
    ]


def test_save_internship_without_token():

    response = client.post(
        "/saved-internships",
        json={
            "user_id": 1,
            "internship_id": 1
        }
    )

    assert response.status_code in [
        401,
        403
    ]