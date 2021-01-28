import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Form, Col, Row, DatePicker, Select, InputNumber } from 'antd';
import { SaveFilled } from '@ant-design/icons'

const { Option } = Select;

const person = {
    "nome": "",
    "cpf": 123456789,
    "rg": 123456,
    "data_nasc": "01/01/2001",
    "sexo": ""
}



export default function Configurations() {

    const onFinish = useCallback((values) => {
        fetch('http://localhost:5000/pessoas', {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(console.log(values))
    }
    );

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div>
            <Col span={12} offset={6}>
            <h1 style={{textAlign:"center"}}>Cadastrar Pessoa</h1>
            <Form  name="basic"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                >
                <Form.Item label="Nome"
                    name="nome"
                    rules={[{ required: true, message: 'Por favor digite o nome' }]}>
                    <Input></Input>
                </Form.Item>
                <Form.Item label="CPF(somente números)"
                    name="cpf"
                    rules={[{ required: true, message: 'Por favor digite o CPF' }]}>
                    <Input type="number"  ></Input>
                </Form.Item>
                <Form.Item label="RG(somente números)"
                    name="eg"
                    rules={[{ required: true, message: 'Por favor digite o RG' }]}>
                    <Input type="number"></Input>
                </Form.Item>
                <Form.Item label="Data de Nascimento"
                    name="data_nasc"
                    rules={[{ required: true, message: 'Por favor selecione a data' }]}>
                    <DatePicker format='DD/MM/YYYY'></DatePicker>
                </Form.Item>
                <Form.Item label="Sexo"
                    name="sexo"
                    rules={[{ required: true, message: 'Por favor selecione o sexo' }]}>
                    <Select  style={{ width: 120 }} >
                        <Option value="Masculino">Masculino</Option>
                        <Option value="Feminino">Feminino</Option>
                    </Select>
                </Form.Item>
                <Button style={{position:"absolute",left:"50%"}}type="primary" htmlType="submit"><SaveFilled /> Cadastrar </Button>
            </Form>
                        </Col>

        </div >
    )
}