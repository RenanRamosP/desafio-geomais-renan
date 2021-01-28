import React, { useState, useEffect } from 'react';
import { Table, Space, Col, Button, Input, Select } from 'antd';
import { SearchOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'

const { Option } = Select;



const columns = [
    {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',

    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
        key: 'cpf',
    },
    {
        title: 'RG',
        dataIndex: 'rg',
        key: 'rg',
    },
    {
        title: 'Sexo',
        key: 'sexo',
        dataIndex: 'sexo'

    },
    {
        title: 'Data de Nascimento',
        key: 'data_nasc',
        dataIndex: 'data_nasc'

    },
    {
        title: 'Ações',
        key: 'action',
        render: () => (
            <Space size="middle">
                <Button style={{ backgroundColor: '#C2CAD0' }}><EditFilled /> Edit</Button>
                <Button style={{ backgroundColor: '#E7717D' }} ><DeleteFilled /> Delete</Button>
            </Space>
        ),
    },
];


export default function Configurations() {

    const [persons, setPersons] = useState()
    useEffect(
        async () => {
            await fetch('http://localhost:5000/pessoas', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then(resp => resp.json()).then(setPersons)
        }, [])

    const selectBefore = (
        <Select defaultValue="nome" className="select-before" style={{ width: 200 }}>
            <Option value="nome">Nome</Option>
            <Option value="cpf">CPF</Option>
            <Option value="rg">RG</Option>
            <Option value="sexo">Sexo</Option>
            <Option value="data_nasc">Data de Nascimento</Option>
        </Select>
    );

    const buttonAfter = (
        <Button style={{ width: 150 }}><SearchOutlined /> Buscar</Button>
    )

    const numPessoas = (objPessoas) => {
        try {
            return Object.keys(objPessoas).length
        }catch{
            return 0
        }
    }

    return (
        <div>
            <Col span={22} offset={1} >
                <h1 style={{ textAlign: "center" }}>Lista de Pessoas</h1>
                <h2>Buscar Por:</h2>
                <Input addonBefore={selectBefore} addonAfter={buttonAfter}></Input>
                <h3>{numPessoas(persons)} Pessoas enconstradas.</h3>
                <Table columns={columns} dataSource={persons} />
            </Col>
        </div>
    )
}