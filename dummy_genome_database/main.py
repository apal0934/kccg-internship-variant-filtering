import graphene
from fastapi import FastAPI
from mongoengine import connect, disconnect_all
from starlette.graphql import GraphQLApp

from dummy_genome_database.mutations.mutations import Mutations


class Query(graphene.ObjectType):
    hello = graphene.String(name=graphene.String(default_value="stranger"))

    def resolve_hello(self, info, name):
        return "Hello " + name


app = FastAPI()


@app.on_event("startup")
def connect_db_client():
    connect("genomes")


@app.on_event("shutdown")
def shutdown_db_client():
    disconnect_all


app.add_route("/", GraphQLApp(schema=graphene.Schema(query=Query, mutation=Mutations)))
