import click
from util.client import HTTP
import util.assertions as assertions

@click.group()
def grading():
    pass

@grading.command()
@click.argument('name', required=True)
@click.argument('data', nargs=-1)
@click.option("-p", "--private", is_flag=True, default=False)
@assertions.logged_in
def create(name, private, data):
    data = [*data]

    if len(data) == 0:
        click.echo("[error] must have at least 1 grade to create a grading system", err=True)
        return

    HTTP.post("/grading-systems", data={
        'public': not private,
        'data': data,
        'name': name
    }).raise_for_status()

    click.echo("OK")

@grading.command()
@assertions.logged_in
def list():
    res = HTTP.get("/grading-systems")
    res.raise_for_status()

    results = res.json()

    out = []

    for result in results:
        # maps the grades to a list
        # of values in the format 
        # - {value}
        # joined by a newline for each value

        fmt = "\n".join(map(lambda x: f"- {x}", result.get("data")))
        name = result.get("name")

        # nicer representation of true/false
        pub = "true" if result.get("public") else "false"

        # author's name
        author = result.get("author").get("name")

        out.append(f"{name} (author = {author}, public = {pub}):\n{fmt}\n")
    
    click.echo_via_pager(out)