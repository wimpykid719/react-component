import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Checkbox from "../CheckBox";
import RemoveButton from "../RemoveButton";

const SCROLL_HEIGHT = 576;
const INITIAL_PAGE_URL = "https://pokeapi.co/api/v2/pokemon?limit=10";

type PokemonResults = {
  name: string;
  url: string;
};

type PokemonFetchedData = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonResults[];
};

type Pokemon = PokemonResults & {
  checked: boolean;
};

type PokemonObj =
  | Record<Pokemon["name"], Pokemon | undefined>
  | Record<Pokemon["name"], never>;

const TableLayoutInfinityLoading: React.FC = () => {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [url, setUrl] = useState<string | undefined>(INITIAL_PAGE_URL);
  const [checkedPokemons, setCheckedPokemons] = useState<PokemonResults[]>([]);
  const [pokemonNames, setPokemonNames] = useState<Pokemon["name"][]>([]);
  const [pokemonObj, setPokemonObj] = useState<PokemonObj>({});

  useEffect(() => {
    execFetchInitialPokemon();
  }, []);

  const fetchPokemon = async (url: string | undefined) => {
    try {
      if (!url) return;
      const response = await fetch(url);
      const data: PokemonFetchedData = await response.json();
      const nextUrl = data.next || undefined;
      setUrl(nextUrl);
      setPokemonObj((prePokemonObj) => {
        const newPokemonObj = pokemonSelectCheckedObj(
          data.results,
          checkedPokemons
        );
        return { ...prePokemonObj, ...newPokemonObj };
      });
      setPokemonNames((prePokemonNames) => {
        return [
          ...prePokemonNames,
          ...data.results.map((result) => result.name),
        ];
      });
    } catch {
      setIsError(true);
    }
  };

  const execFetchInitialPokemon = async () => {
    setIsLoading(true);
    await fetchPokemon(INITIAL_PAGE_URL);
    setIsLoading(false);
  };

  const execFetchPokemon = async () => {
    setIsLoading(true);
    await fetchPokemon(url);
    setIsLoading(false);
  };

  const isNameChecked = (
    pokemonName: Pokemon["name"],
    checkedPokemons: PokemonResults[]
  ) =>
    checkedPokemons.some(
      (checkedPokemon) => checkedPokemon.name === pokemonName
    );

  const pokemonSelectCheckedObj = (
    pokemonResults: PokemonResults[],
    checkedPokemons: PokemonResults[]
  ) => {
    return pokemonResults.reduce((obj, element) => {
      const pokemonName = element.name;
      const url = element.url;
      return {
        ...obj,
        [pokemonName]: {
          name: pokemonName,
          url,
          checked: isNameChecked(pokemonName, checkedPokemons),
        },
      };
    }, {});
  };

  const addPokemon = (pokemon: Pokemon | undefined) => {
    if (!pokemon) return;
    const pokemonName = pokemon.name;
    setPokemonObj((prePokemonObj) => {
      return {
        ...prePokemonObj,
        [pokemonName]: {
          name: prePokemonObj[pokemonName]?.name || "",
          url: prePokemonObj[pokemonName]?.url || "",
          checked: true,
        },
      };
    });
    setCheckedPokemons((preCheckedPokemons) => {
      const checkedPokemon = { name: pokemon.name, url: pokemon.url };
      if (!preCheckedPokemons) {
        return [checkedPokemon];
      } else {
        return [...preCheckedPokemons, checkedPokemon];
      }
    });
  };

  const removePokemon = (pokemonName: Pokemon["name"] | undefined) => {
    if (!pokemonName) return;
    setPokemonObj((prePokemonObj) => {
      return {
        ...prePokemonObj,
        [pokemonName]: {
          name: prePokemonObj[pokemonName]?.name || "",
          url: prePokemonObj[pokemonName]?.url || "",
          checked: false,
        },
      };
    });

    setCheckedPokemons((preCheckedPokemons) => {
      return preCheckedPokemons.filter(
        (checkedPokemon) => checkedPokemon.name !== pokemonName
      );
    });
  };

  const onScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (!tableRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (
      clientHeight + scrollTop !== scrollHeight ||
      isLoading ||
      !url ||
      tableRef.current?.clientHeight < SCROLL_HEIGHT
    )
      return;
    await execFetchPokemon();
  };

  return (
    <Contents>
      <TableWrapper onScroll={onScroll}>
        <Table ref={tableRef}>
          <Thead>
            <Tr className="TrTh">
              <Th>ポケモン名</Th>
              <Th>詳細URL</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pokemonNames.length === 0 ? (
              <Tr>
                <Td colSpan={2}>
                  <NoPokemon>
                    {isError
                      ? "ネットワークエラー、ポケモンを取得できません"
                      : "ポケモンが表示されます"}
                  </NoPokemon>
                </Td>
              </Tr>
            ) : (
              pokemonNames.map((name) => (
                <FetchedTr
                  className="TrTd"
                  key={name}
                  onClick={
                    pokemonObj[name]?.checked
                      ? () => removePokemon(pokemonObj[name]?.name)
                      : () => addPokemon(pokemonObj[name])
                  }
                >
                  <Td>
                    <Checkbox
                      checked={!!pokemonObj[name]?.checked}
                      label={pokemonObj[name]?.name || ""}
                    ></Checkbox>
                  </Td>
                  <Td>{pokemonObj[name]?.url}</Td>
                </FetchedTr>
              ))
            )}
            {!isLoading && (
              <Tr>
                <TdLoading colSpan={2}>
                  <LoaderWrapper>
                    <LoadingCircle />
                  </LoaderWrapper>
                </TdLoading>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableWrapper>
      <TableWrapper>
        <Table>
          <Thead>
            <Tr className="TrTh">
              <Th>ポケモン名</Th>
              <Th>詳細URL</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!checkedPokemons || checkedPokemons.length === 0 ? (
              <Tr>
                <Td colSpan={2}>
                  <NoPokemon>選択中のポケモンが表示されます</NoPokemon>
                </Td>
              </Tr>
            ) : (
              checkedPokemons.map((checkedPokemon) => (
                <Tr className="TrTd" key={checkedPokemon.name}>
                  <PokemonNameTd>
                    <RemoveButton
                      onClick={() => removePokemon(checkedPokemon.name)}
                    />
                    {checkedPokemon.name}
                  </PokemonNameTd>
                  <Td>{checkedPokemon.url}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableWrapper>
    </Contents>
  );
};

const Contents = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 880px;
  gap: 20px;
  margin: 0 auto;
  @media screen and (max-width: 1279px) {
    flex-direction: column;
    gap: 0;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-width: 432px;
  width: 100%;
  border-radius: 4px;
  border: solid 1px #ccc;
  max-height: ${SCROLL_HEIGHT}px;
  overflow-y: scroll;
  margin-top: 20px;
  @media screen and (max-width: 1279px) {
    max-width: 600px;
  }
  @media screen and (max-width: 720px) {
    min-width: 290px;
  }
`;

const Table = styled.table`
  text-align: left;
  border-collapse: collapse;
  width: 100%;
  white-space: nowrap;
`;

const Thead = styled.thead``;

const Tbody = styled.tbody``;

const NoPokemon = styled.p`
  color: #777;
  text-align: center;
  padding: 51px 0px 59px;
  @media screen and (max-width: 720px) {
    padding: 24px 0 26px;
  }
`;

const Tr = styled.tr`
  &.TrTh {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #eee;
  }
  &.TrTd:nth-of-type(-n + 9) {
    border-bottom: solid 1px #ccc;
  }
  &.TrTd:not(:last-of-type) {
    border-bottom: solid 1px #ccc;
  }
  &:nth-of-type(even) {
    background: #fafafa;
  }
`;

const FetchedTr = styled(Tr)`
  cursor: pointer;
`;

const Th = styled.th`
  padding: 16px 14px;
  box-shadow: inset 0 -1px 0 #ccc;
  :first-of-type {
    width: 32%;
  }
  &:not(:last-of-type) {
    box-shadow: inset 0 -1px 0 #ccc, inset -1px 0 0 #ccc;
  }
`;

const Td = styled.td`
  padding: 16px 14px;
  vertical-align: middle;
  &:not(:last-of-type) {
    border-right: 1px solid #ccc;
  }
`;

const PokemonNameTd = styled(Td)`
  display: flex;
  align-items: center;
`;

const TdLoading = styled.td``;

const LoaderWrapper = styled.div`
  position: relative;
  background: #fafafa;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: solid 4px;
  border-color: #000000 #00000010 #00000010;
  position: relative;
  animation-name: spin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default TableLayoutInfinityLoading;
