import dayjs from 'dayjs';

export interface SoftDeletable {
    id: string
    deletedAt: Date | null
}

export interface BasePrismaDelegate<
    TModel extends SoftDeletable,
    TSelect,
    TCreate,
    TUpdate
> {
    findFirst(args: { where?: any; select?: TSelect | null }): Promise<TModel | null>
    findUnique(args: { where: any; select?: TSelect | null }): Promise<TModel | null>
    create(args: { data: TCreate }): Promise<TModel>
    update(args: { where: { id: string }; data: TUpdate & { deletedAt?: any } }): Promise<TModel>
}

export abstract class BaseQueries<
    TModel extends SoftDeletable,
    TWhere,
    TSelect,
    TCreate,
    TUpdate,
> {
    protected constructor(protected readonly delegate: BasePrismaDelegate<TModel, TSelect, TCreate, TUpdate>) {}

    /**
     * Select one raw from database
     * @param select {TModel | null} default prisma
     * select options, or null in case all attributes are needed
     * @param where {TWhere} default prisma where options
     * @param options additional search options
     * */
    public findOne(
        select: TSelect | null,
        where: TWhere,
        options = { softDeleted: false }
    ) {
        return this.delegate.findFirst({
            select,
            where: {
                ...where,
                deletedAt: options.softDeleted
                    ? { not: null }
                    : { equals: null }
            }
        })
    }

    /**
     * Select one raw from database
     * @param id { string } ID of the raw which should be fetched
     * @param select { TModel | null } default pupdaterisma
     * select options, or null in case all attributes are needed
     * @param options additional search options
     * */
    public findByID(
        id: string,
        select: TSelect | null,
        options = { softDeleted: false }
    ) {
        return this.delegate.findFirst({
            select,
            where: {
                id,
                deletedAt: options.softDeleted
                    ? { not: null }
                    : { equals: null }
            }
        })
    }

    /**
     * Creates a new raw in database
     * @param data { TCreate } data for a new record
     * */
    public createOne(data: TCreate) {
        return this.delegate.create({
            data
        })
    }

    /**
     * Update one raw by id
     * @param id { string } id of raw which should be updated
     * @param data { TUpdate } object with new data
     * */
    public updateOne(id: string, data: TUpdate & { deletedAt: any; }) {
        return this.delegate.update({
            where: { id },
            data
        })
    }

    /**
     * Soft delete of raw
     * @param id {string} ID of raw which should be soft-deleted
     * */
    public softDelete(id: string) {
        return this.delegate.update({
            where: { id },
            data: { deletedAt: dayjs().toISOString() } as TUpdate & { deletedAt: any; }
        })
    }
}