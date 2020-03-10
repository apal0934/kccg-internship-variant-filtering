from graphene import Field, Mutation, String

from gene_trustee.models.mapping import MappingModel
from gene_trustee.object_types.mapping import Mapping


class CreateMapping(Mutation):
    class Arguments:
        user_id = String(required=True)
        genome_id = String(required=True)

    mapping = Field(lambda: Mapping)

    def mutate(root, info, genome_id, user_id):
        mapping = MappingModel(user_id=user_id, genome_id=genome_id)
        mapping.save()
        return CreateMapping(mapping=mapping)
