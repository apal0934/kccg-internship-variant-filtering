from graphene import ObjectType

from dummy_genome_database.mutations.genome import (
    AddVariants,
    CreateGenome,
    DeleteGenome,
)


class Mutations(ObjectType):
    create_genome = CreateGenome.Field()
    delete_genome = DeleteGenome.Field()
    add_variants = AddVariants.Field()
