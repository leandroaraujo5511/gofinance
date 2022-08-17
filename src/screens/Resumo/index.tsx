import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "styled-components/native";
import { VictoryPie } from "victory-native";
import { HistoryCard } from "../../components/HistoryCard";
import { useAuth } from "../../hooks/auth";
import { categories } from "../../utils/categories";
import {
  ChartContainer,
  Container,
  Content,
  Header,
  LoadContainer,
  Month,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Title,
} from "./styles";

interface TransactionsData {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormated: string;
  color: string;
  percent: string;
}

export function Resumo() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );

  function handleDateChange(action: "next" | "prev") {
    if (action === "next") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = `@gofinance:transaction_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter(
      (expensive: TransactionsData) =>
        expensive.type === "negative" &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensivesTotal = expensives.reduce(
      (acumulation: number, expensive: TransactionsData) => {
        return acumulation + Number(expensive.amount);
      },
      0
    );
    console.log(expensivesTotal);
    const totalByCategory: CategoryData[] = [];
    categories.forEach((category) => {
      let categorySun = 0;

      expensives.forEach((expensive: TransactionsData) => {
        if (expensive.category === category.key) {
          categorySun += Number(expensive.amount);
        }
      });

      if (categorySun > 0) {
        const totalFormated = categorySun.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const percent = `${((categorySun / expensivesTotal) * 100).toFixed(
          0
        )}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          totalFormated,
          total: categorySun,
          percent: percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );
  return (
    <Container>
      <Header>
        <Title>Resumo por Categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange("prev")}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>
            <Month>
              {format(selectedDate, "MMMM , yyyy", { locale: ptBR })}
            </Month>
            <MonthSelectButton onPress={() => handleDateChange("next")}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              x="percent"
              y="total"
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: "bold",
                  fill: theme.colors.shape,
                },
              }}
              labelRadius={75}
            />
          </ChartContainer>

          {totalByCategories.map((item) => (
            <HistoryCard
              key={item.key}
              title={item.name}
              amount={item.totalFormated}
              color={item.color}
            />
          ))}
        </Content>
      )}
    </Container>
  );
}
