import requests
from requests import Response
from .token import init, get

BASE_API_URL = "http://localhost:4000"
init()

class HTTPClientImpl:
    # produces the headers that are used
    # by the server to identify who the current user is
    # and how they are interacting with the server (website, cli)
    def headers(self):
        return {
            "Authorization": f"Bearer {get().value}" if get() is not None else None,
            "User-Agent": "tlda-cli (https://github.com/getaddrinfo/tlda, v1.0.0)"
        }   

    # GET /url
    def get(self, url):
        response = requests.get(BASE_API_URL + url, headers=self.headers())
        return response

    # PATCH /url + json(data)
    def patch(self, url, data):
        response = requests.patch(BASE_API_URL + url, json=data, headers=self.headers())
        return response

    # POST /url + json(data)
    def post(self, url, data):
        response = requests.post(BASE_API_URL + url, json=data, headers=self.headers())
        return response

    # PUT /url + json(data)
    def put(self, url, data):
        response = requests.put(BASE_API_URL + url, json=data, headers=self.headers())
        return response

    # DELETE /url
    def delete(self, url):
        response = requests.delete(BASE_API_URL + url, headers=self.headers())
        return response


class HTTP:
    instance: HTTPClientImpl

    # initiates the class with
    # all the necessary info to 
    # be used
    @classmethod
    def init(cls):        
        cls.instance = HTTPClientImpl()

    @classmethod
    def get(cls, url) -> Response:
        return cls.instance.get(url)

    @classmethod
    def patch(cls, url, data) -> Response:
        return cls.instance.patch(url, data)

    @classmethod
    def post(cls, url, data) -> Response:
        return cls.instance.post(url, data)

    @classmethod
    def put(cls, url, data=None) -> Response:
        return cls.instance.put(url, data)

    @classmethod
    def delete(cls, url) -> Response:
        return cls.instance.delete(url)