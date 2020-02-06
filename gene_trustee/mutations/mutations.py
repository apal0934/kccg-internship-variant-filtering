from graphene import ObjectType

from gene_trustee.mutations.mapping import CreateMapping


class Mutations(ObjectType):
    create_mapping = CreateMapping.Field()
