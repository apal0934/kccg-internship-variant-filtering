import graphene
from fastapi import FastAPI
from mongoengine import connect, disconnect_all
from starlette.graphql import GraphQLApp
from starlette.middleware.cors import CORSMiddleware

from dummy_genome_database.models.genome import GenomeModel
from dummy_genome_database.mutations.mutations import Mutations
from dummy_genome_database.object_types.genome import Genome
from dummy_genome_database.object_types.variant import Variant
from dummy_genome_database.models.variant import VariantModel


class Query(graphene.ObjectType):
    genomes = graphene.List(Genome, genome_ids=graphene.List(graphene.Int), variant_id=graphene.Int())
    genome = graphene.Field(Genome, genome_id=graphene.String())

    variants = graphene.List(Variant)

    def resolve_genomes(self, info, genome_ids=None, variant_id=None):
        if genome_ids and variant_id:
            return list(GenomeModel.objects(genome_id__in=genome_ids, variants=variant_id))
        return list(GenomeModel.objects.all())

    def resolve_genome(self, info, genome_id):
        return GenomeModel.objects.get(pk=genome_id)

    def resolve_variants(self, info):
        return list(VariantModel.objects.all())


app = FastAPI()


@app.on_event("startup")
def connect_db_client():
    connect("genomes")


@app.on_event("shutdown")
def shutdown_db_client():
    disconnect_all


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.add_route("/", GraphQLApp(schema=graphene.Schema(query=Query, mutation=Mutations)))
