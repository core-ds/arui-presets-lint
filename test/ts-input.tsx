import React, { type FC } from 'react';

import { type Product, SumTestFunc, type User } from './types';

// This is the same as above, but with an extra parameter.
// Note: to make this work though, we had to use an any. This
// can be worked out by using a generic interface.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CheckImportType = Product & User;
SumTestFunc();

interface CacheHostGeneric<ContentType> {
    save: (a: ContentType) => void;
}

// Now when the CacheHostGeneric is used, you need to tell
// it what ContentType is.

function addTypedObjectToCache<Type, Cache extends CacheHostGeneric<Type>>(
    obj: Type,
    cache: Cache,
): Cache {
    cache.save(obj);

    return cache;
}

class SuperCache<T> implements CacheHostGeneric<T> {
    private readonly store: T[] = [];

    save(a: T) {
        this.store.push(a);
    }

    getSome() {
        return this.store.pop();
    }
}

const cache = new SuperCache<number>();

addTypedObjectToCache(123, cache);

export type PickedCacheHost = Required<Pick<CacheHostGeneric<string>, 'save'>>;

export enum STATUS {
    NONE = '0',
    SUCCESS = '1',
}

const SomeComponent: FC<{ title?: string }> = (props) => <div>{props.title}</div>;

export const Component = () => <SomeComponent title='Привет' />;

