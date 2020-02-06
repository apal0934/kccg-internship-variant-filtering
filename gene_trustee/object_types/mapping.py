from graphene_mongo import MongoengineObjectType

from gene_trustee.models.mapping import MappingModel


class Mapping(MongoengineObjectType):
    class Meta:
        model = MappingModel
