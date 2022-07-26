import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from "react-native";
import uuid from "react-native-uuid";
import * as Yup from "yup";
import { Button } from "../../components/Form/Button";
import { CategorySelectButton } from "../../components/Form/CategorySelectButton";
import { InputForm } from "../../components/Form/InputForm";
import { TransactionType } from "../../components/Form/TransactionType";
import { CategorySelect } from "../CategorySelect";
import {
  Container,
  ContainerTransaction,
  Fields,
  Form,
  Header,
  Title,
} from "./styles";

interface FormData {
  name: string;
  amount: string;
}

type Nav = {
  navigate: (value: string) => void;
};

const schema = Yup.object().shape({
  name: Yup.string().required("Nome é Obrigatorio"),
  amount: Yup.number()
    .typeError("Informe um valor númerico")
    .positive("O valor não pode ser negativo")
    .required("O valor é Obrigatorio"),
});

export function Register() {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpem] = useState(false);
  const dataKey = "@gofinance:transaction";
  const { navigate } = useNavigation<Nav>();
  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  function handleTransactionTypeSelect(type: "positive" | "negative") {
    setTransactionType(type);
  }

  function handleResetState() {
    setTransactionType("");
    setCategory({
      key: "category",
      name: "Categoria",
    });
    reset();
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpem(true);
  }
  function handleCloseSelectCategoryModal() {
    setCategoryModalOpem(false);
  }

  async function handleRegister(form: FormData) {
    if (!transactionType) return Alert.alert("Selecione o tipo da transação");
    if (category.key === "category")
      return Alert.alert("Selecione uma categoria");

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date(),
    };
    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];
      const dataFormated = [...currentData, newTransaction];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormated));

      handleResetState();
      navigate("Listagem");
    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possivel salvar os dados");
    }
  }
  useEffect(() => {
    async function handleVisualization() {
      const data = await AsyncStorage.getItem(dataKey);
      console.log(JSON.parse(data!));
    }
    handleVisualization();
  }, []);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>
        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />
            <ContainerTransaction>
              <TransactionType
                title="Income"
                type="up"
                onPress={() => handleTransactionTypeSelect("positive")}
                isActive={transactionType === "positive"}
              />
              <TransactionType
                title="Outcome"
                type="down"
                onPress={() => handleTransactionTypeSelect("negative")}
                isActive={transactionType === "negative"}
              />
            </ContainerTransaction>
            <CategorySelectButton
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>
          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
