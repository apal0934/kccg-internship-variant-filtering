from graphene import Field, Mutation, Int, List, String

from dummy_genome_database.models.genome import GenomeModel
from dummy_genome_database.object_types.genome import Genome


class CreateGenome(Mutation):
    class Arguments:
        genome_id = Int(required=True)
        variants = List(Int)

    genome = Field(lambda : Genome)

    @staticmethod
    def mutate(root, info, genome_id, variants=[]):
        genome = GenomeModel(genome_id=genome_id, variants=variants)
        genome.save()
        return CreateGenome(genome=genome)


class AddVariants(Mutation):
    class Arguments:
        genome_id = String(required=True)
        variant_ids = List(Int)

    genome = Field(lambda: Genome)

    @staticmethod
    def mutate(root, info, genome_id, variant_ids):
        genome = GenomeModel.objects.get(id=genome_id)

        for variant_id in variant_ids:
            genome.variants.append(variant_id)

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
