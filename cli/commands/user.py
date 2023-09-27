import click
from util.client import HTTP
import util.assertions as assertions
from getpass import getpass

def is_empty_string(data):
    out = ""

    for i in data:
        out += i

    return out == ""

@click.group()
def user():
    pass

@user.command()
@click.argument('email')
@click.argument('role')
@click.argument('name')
@click.argument('departments', nargs=-1)
@assertions.logged_in
def create(
    email,
    role,
    name,
    departments
):
    password = getpass("password: ")
    confirm = getpass("confirm: ")

    if password != confirm:
        click.echo("[error] passwords do not match")
        return

    HTTP.post("/users", data={
        "email": email,
        "role": role.upper(),
        "name": name,
        "password": password,
        "departments": departments
    }).raise_for_status()

    click.echo("OK")

@user.command()
@click.argument("id")
def get(id):
    res = HTTP.get(f"/users/{id}/profile")
    
    if not res.ok and res.status_code == 404:
        click.echo("[error] teacher not found")
        return

    res.raise_for_status()

    data = res.json()
    department_formatted = "\n".join([
        f"* {dep.get('name')} (id={dep.get('id')}, lead={'false' if not dep.get('lead') else 'true'})" for dep in data['departments']
    ])

    out = """id: {id}
name: {name}
email: {email}
preferred name: {preferred_name}
role: {role}
departments:
{department_formatted}
stats:
* students currently taught: {stats_num_students}
* classes currently taught: {stats_num_classes}
""".format(
        **data, 
        department_formatted=department_formatted,
        stats_num_students = data.get("stats").get("students"),
        stats_num_classes = data.get("stats").get("classes")
    )

    click.echo(out)

@user.command()
@click.argument("id")
@click.option("-apd", "--accept-permanent-damage", is_flag=True, default=False)
@assertions.logged_in
def delete(id, accept_permanent_damage):
    if not accept_permanent_damage:
        click.echo("[danger]: add --accept-permanent-damage flag to continue", err=True)
        return

    HTTP.delete(f"/users/{id}").raise_for_status()


    click.echo("OK")

@user.group()
def role():
    pass

@role.command()
@click.argument('id')
@click.option('-r', '--role', type=click.Choice(['admin', 'slt', 'teacher'], case_sensitive=False))
@assertions.logged_in
def set(id, role):
    HTTP.patch(f"/users/{id}", data={
        'role': role.upper() if role else None
    }).raise_for_status()

    click.echo("OK")

@user.group()
def department():
    pass

@department.command()
@click.argument("user_id")
@click.argument("department_id")
@assertions.logged_in
def add(user_id, department_id):
    HTTP.put(f"/users/{user_id}/departments/{department_id}").raise_for_status()
    click.echo("OK")

@department.command()
@click.argument("user_id")
@click.argument("department_id")
@assertions.logged_in
def remove(user_id, department_id):
    HTTP.delete(f"/users/{user_id}/departments/{department_id}").raise_for_status()
    click.echo("OK")
