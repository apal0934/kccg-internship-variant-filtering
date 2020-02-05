from graphene import Field, String, Mutation, List

from dummy_genome_database.models.variant import VariantModel
from dummy_genome_database.object_types.variant import Variant


class CreateVariant(Mutation):
    class Arguments:
        name = String(required=True)
        hpo_terms = List(String)

    variant = Field(lambda: Variant)

    def mutate(root, info, name, hpo_terms):
        variant = VariantModel(name=name, hpo_terms=hpo_terms)
        variant.save()

        return CreateVariant(variant=variant)


class UpdateVariant(Mutation):
    class Arguments:
        variant_id = String(required=True)
        name = String()

    variant = Field(lambda: Variant)

    def mutate(root, info, variant_id, name):
        variant = VariantModel.objects.get(id=variant_id)
        variant.name = name
        variant.save()
        return UpdateVariant(variant=variant)


class DeleteVariant(Mutation):
    class Arguments:
        variant_id = String(required=True)

    variant = Field(lambda: Variant)

    def mutate(root, info, variant_id):
        variant = VariantModel.objects.get(id=variant_id)
        variant.delete()
        return DeleteVariant(variant=variant)
