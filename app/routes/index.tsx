import { useState } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Hits,
  SearchBox,
  RefinementList,
  Pagination,
  Highlight,
  InstantSearchProps,
} from "react-instantsearch-dom";
import { findResultsState } from "react-instantsearch-dom/server";
import {
  LinksFunction,
  LoaderFunction,
  useLoaderData,
  useLocation,
} from "remix";
import * as qs from "qs";

import searchStylesUrl from "~/styles/search.css";
import instantSearchStylesUrl from "instantsearch.css/themes/satellite-min.css";

const searchClient = algoliasearch(
  "latency",
  "6be0576ff61c053d5f9a3225e2a90f76"
);
const indexName = "instant_search";

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: instantSearchStylesUrl },
    { rel: "stylesheet", href: searchStylesUrl },
  ];
};

export let loader: LoaderFunction = ({ request }) => {
  return findResultsState(SearchContent, {
    searchClient,
    indexName,
    url: request.url,
  });
};

export default function Search() {
  const resultsState = useLoaderData<InstantSearchProps["resultsState"]>();
  const url = useLocation().search;
  return <SearchContent resultsState={resultsState} url={url} />;
}

const parser = {
  parse(url: string): object {
    const urlObj = new URL(url, "https://example.com");
    return qs.parse(urlObj.search, {
      ignoreQueryPrefix: true,
      arrayLimit: 100,
    });
  },
  stringify(object: object): string {
    return qs.stringify(object, { addQueryPrefix: true });
  },
};

function SearchContent(
  props: Pick<InstantSearchProps, "widgetsCollector" | "resultsState"> & {
    url: string;
  }
) {
  const [searchState, setSearchState] = useState(parser.parse(props.url));

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      searchState={searchState}
      onSearchStateChange={(searchState) => {
        setSearchState(searchState);
        history.pushState(searchState, "", parser.stringify(searchState));
      }}
      {...props}
    >
      <div className="search-panel">
        <div className="search-panel__filters">
          <RefinementList attribute="brand" />
        </div>

        <div className="search-panel__results">
          <SearchBox
            className="searchbox"
            translations={{
              placeholder: "",
            }}
          />
          <Hits hitComponent={Hit} />

          <div className="pagination">
            <Pagination />
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}

function Hit(props: { hit: any }) {
  return (
    <article>
      <h1>
        <Highlight attribute="name" hit={props.hit} />
      </h1>
      <p>
        <Highlight attribute="description" hit={props.hit} />
      </p>
    </article>
  );
}
