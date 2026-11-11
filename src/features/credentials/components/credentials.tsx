"use client";
import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, ErrorView, LoadingView } from "@/components/entity-components";
import { EntityContainer, EntitySearch } from "@/components/entity-components";
import { useCredentialParams } from "../hooks/use-credential-params";
import { useEntitySearch } from "../../../hooks/use-entity-search";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import type { Credential } from "@/generated/prisma/client";
import { KeyRoundIcon } from "lucide-react";
export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) =>
                <CredentialItem data={credential} />
            }
            emptyView={<CredentialsEmpty />}
        />
    )
};
export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader
            title="Credentials"
            description="Create and manage your credentials"
            newButtonLabel="New credential"
            disabled={disabled}
            newButtonHref="/credentials/new"
        />
    )
};

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialParams();
    return (
        <EntityPagination
            disabled={credentials.isFetching}
            page={credentials.data.page}
            totalPages={credentials.data.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const CredentialsContainer = ({
    children
}: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}

        </EntityContainer>
    )
}

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    });
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search credentials"
        />
    )
}

export const CredentialsLoading = () => {
    return (
        <LoadingView message="Loading Credentials..." />
    )
};

export const CredentialsError = () => {
    return (
        <ErrorView message="Error Loading Credentials!" />
    )
};

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push(`/credentials/new`);
    };
    return (
        <EmptyView
            message="Please create credentials to get started"
            onNew={handleCreate}
        />
    )
}

export const CredentialItem = ({ data }: { data: Credential }) => {
    const removeCredential = useRemoveCredential();
    const handleRemove = () => {
        removeCredential.mutate({ id: data.id })
    }
    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created {" "}
                    {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <KeyRoundIcon className="size-5 text-muted-foreground" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    );
}