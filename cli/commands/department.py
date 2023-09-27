import click
from util.client import HTTP
import util.assertions as assertions

@click.group()
def department():
    pass

@department.command()
@click.argument('name')
@click.option('-l', '--lead_id', required=True)
@assertions.logged_in
def create(
    name,
    lead_id
):  
    # creates a department
    HTTP.post("/departments", data={
        "name": name,
        "lead_id": lead_id
    }).raise_for_status()

    click.echo("OK")

@department.command()
@assertions.logged_in
def list():
    r = HTTP.get("/departments")
    r.raise_for_status()

    out = []

    for data in r.json():
        name = data.get("name") 
        id = data.get("id")

        out.append(f"{name} ({id})")

    click.echo_via_pager("\n".join(map(lambda x: f"* {x}", out)))

@department.command()
@assertions.logged_in
@click.argument('id')
def delete(id):
    HTTP.delete(f"/departments/{id}").raise_for_status()
    click.echo("OK")