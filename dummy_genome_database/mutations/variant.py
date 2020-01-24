from graphene import Field, String, Mutation

from dummy_genome_database.models.variant import VariantModel
from dummy_genome_database.object_types.variant import Variant


class CreateVariant(Mutation):
    class Arguments:
        hpo_term = String(required=True)

    variant = Field(lambda: Variant)

    def mutate(root, info, hpo_term):
        variant = VariantModel(hpo_term=hpo_term)
        variant.save()

        return CreateVariant(variant=variant)


class DeleteVariant(Mutation):
    class Arguments:
        variant_id = String(required=True)

    variant = Field(lambda: Variant)

    def mutate(root, info, variant_id):
        variant = VariantModel.objects.get(id=variant_id)
        variant.delete()
        return DeleteVariant(variant=variant)
