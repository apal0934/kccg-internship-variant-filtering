import graphene
from fastapi import FastAPI
from mongoengine import connect, disconnect_all
from starlette.graphql import GraphQLApp
from starlette.middleware.cors import CORSMiddleware

from gene_trustee.models.mapping import MappingModel
from gene_trustee.object_types.mapping import Mapping
from gene_trustee.mutations.mutations import Mutations


class Query(graphene.ObjectType):
    user_to_genome = graphene.Field(Mapping, user_id=graphene.String())
    users_to_genomes = graphene.List(Mapping, user_ids=graphene.List(graphene.String))

    def resolve_user_to_genome(self, info, user_id):
        return MappingModel.objects.get(user_id=user_id)

    def resolve_users_to_genomes(self, info, user_ids):
        return list(MappingModel.objects(user_id__in=user_ids))


app = FastAPI()


@app.on_event("startup")
def connect_db_client():
    connect("genetrustee")


@app.on_event("shutdown")
def shutdown_db_client():
    disconnect_all


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_route("/", GraphQLApp(schema=graphene.Schema(query=Query, mutation=Mutations)))
