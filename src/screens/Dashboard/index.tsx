import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useTheme } from "styled-components/native";
import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionsCardProps,
} from "../../components/TransactionCard";
import {
  Container,
  Header,
  HighlightCards,
  Icon,
  LoadContainer,
  LogoutButton,
  Photo,
  Title,
  TransactionList,
  Transactions,
  User,
  UserGreeting,
  UserInfo,
  UserName,
  UserWrapper,
} from "./styles";

export interface DataListProps extends TransactionsCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}
interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<DataListProps[]>([]);
  const [HighlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );
  const dataKey = "@gofinance:transaction";

  function getLastTransactionDate(
    collection: DataListProps[],
    type: "positive" | "negative"
  ) {
    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collection
          .filter((transaction) => transaction.type === "positive")
          .map((transaction) => new Date(transaction.date).getTime())
      )
    );

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
      "pt-BR",
      { month: "long" }
    )}`;
  }

  async function loaderTransaction() {
    const response = await AsyncStorage.getItem(dataKey);
    const transaction = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormated: DataListProps[] = transaction.map(
      (item: DataListProps) => {
        if (item.type === "positive") {
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const date = Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      }
    );

    setTransaction(transactionsFormated);
    const lastTransactionEntries = getLastTransactionDate(
      transaction,
      "positive"
    );
    const lastTransactionExpensive = getLastTransactionDate(
      transaction,
      "negative"
    );

    const totalInterval = `01 a ${lastTransactionEntries}`;
    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: `Última entrada dia ${lastTransactionEntries}`,
      },
      expensives: {
        amount: expensiveTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: `Última saída dia ${lastTransactionExpensive}`,
      },
      total: {
        amount: total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: totalInterval,
      },
    });
    setIsLoading(false);
  }

  useEffect(() => {
    loaderTransaction();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loaderTransaction();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: "https://avatars.githubusercontent.com/u/48131407?v=4",
                  }}
                />
                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Leandro</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={() => {}}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              type="up"
              title="Entrada"
              amount={HighlightData.entries.amount}
              lastTransaction={HighlightData.entries.lastTransaction}
            />
            <HighlightCard
              type="down"
              title="Saidas"
              amount={HighlightData.expensives.amount}
              lastTransaction={HighlightData.expensives.lastTransaction}
            />
            <HighlightCard
              type="total"
              title="Total"
              amount={HighlightData.total.amount}
              lastTransaction={HighlightData.total.lastTransaction}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagens</Title>
            <TransactionList
              data={transaction}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
