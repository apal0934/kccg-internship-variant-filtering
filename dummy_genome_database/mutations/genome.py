from graphene import Field, Int, List, Mutation, String

from dummy_genome_database.models.genome import GenomeModel
from dummy_genome_database.object_types.genome import Genome
from dummy_genome_database.models.variant import VariantModel


class CreateGenome(Mutation):
    class Arguments:
        genome_id = Int(required=True)

    genome = Field(lambda: Genome)

    @staticmethod
    def mutate(root, info, genome_id):
        genome = GenomeModel(genome_id=genome_id)
        genome.save()
        return CreateGenome(genome=genome)


class AddVariants(Mutation):
    class Arguments:
        genome_id = String(required=True)
        variant_ids = List(String)

    genome = Field(lambda: Genome)

    @staticmethod
    def mutate(root, info, genome_id, variant_ids):
        genome = GenomeModel.objects.get(id=genome_id)

        for variant_id in variant_ids:
            variant = VariantModel.objects.get(id=variant_id)
            genome.variants.append(variant)

        genome.save()
        return AddVariants(genome=genome)


class DeleteGenome(Mutation):
    class Arguments:
        genome_id = String(required=True)

    genome = Field(lambda: Genome)

    @staticmethod
    def mutate(root, info, genome_id):
        genome = GenomeModel.objects.get(id=genome_id)
        genome.delete()
        return DeleteGenome(genome=genome)
