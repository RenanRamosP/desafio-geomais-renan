import React, { useState, useEffect } from 'react';
import { Button, Input, Form, Col, Modal, DatePicker, Select } from 'antd';
import { SaveFilled } from '@ant-design/icons'
import moment from 'moment';
import { validate } from 'gerador-validador-cpf'


const { Option } = Select;


export default function Configurations() {

    var payloadInfo = {
        "nome": false,
        "cpf": false,
        "rg": false,
        "data_nasc": false,
        "sexo": false,
        "safeToRegister": true
    }
    const [safePayload, setSafePayload] = useState(payloadInfo)
    const [persons, setPersons] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const  [formValue, setFormValue]= useState({
        "nome": "",
        "cpf": "",
        "rg": "",
        "data_nasc": "",
        "sexo": ""})


    const handleOk = () => {
        setIsModalVisible(false);
        safePayload.nome && safePayload.rg && safePayload.cpf && safePayload.data_nasc && safePayload.sexo && safePayload.safeToRegister ? onFinish(formValue) : void 0 ;
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };


    useEffect(
        () => {
            fetch('http://localhost:5000/pessoas', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then(resp => resp.json()).then(setPersons)
        }, [])


    const onFinish = (values) => {
        fetch('http://localhost:5000/pessoas', {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then("cadastrado:"+console.log(values))
    };


    const validateValues = (values) => {
        //validating name values
        (/^[ a-zA-ZçÇÁáÀàãÃóÓõÕéÉíÍ]+$/.test(values.nome)) ? payloadInfo.nome = true : payloadInfo.nome = false;

        //Validating CPF generating rules and parsing to db standard
        validate(values.cpf) ? payloadInfo.cpf = true : payloadInfo.cpf = false;
        values.cpf = values.cpf.toString().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

        //parsing RG to db standard
        (/^[0-9]+$/.test(values.rg)) ? payloadInfo.rg = true : payloadInfo.rg = false;
        values.rg = values.rg.toString().replace(/(\d{2,3})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");

        //converting dates to db standard}
        try {
            var convertedDate = moment(values.data_nasc.format('DD/MM/YYYY'));
            values.data_nasc = convertedDate._i.toString();
            payloadInfo.data_nasc = true;
        } catch {
            payloadInfo.data_nasc = false;
        }

        //double-checking gender parameters of the payload
        (values.sexo === "Masculino" || values.sexo === "Feminino") ? payloadInfo.sexo = true : payloadInfo.sexo = false;

        //checking if the person rg and cpf was already registered 
        persons.forEach((element) => {
            values.rg === element.rg ? payloadInfo.safeToRegister = false : void 0;
            values.cpf === element.cpf ? payloadInfo.safeToRegister = false : void 0;
        })
    
        setSafePayload(payloadInfo);
        setIsModalVisible(true);
        setFormValue(values);
        

    }

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div>
            <Col span={12} offset={6}>
                <h1 style={{ textAlign: "center" }}>Cadastrar Pessoa</h1>
                <Form name="basic"
                    initialValues={{ remember: true }}
                    onFinish={validateValues}
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
                        name="rg"
                        rules={[{ required: true, message: 'Por favor digite o RG' }]}>
                        <Input type="number"></Input>
                    </Form.Item>
                    <Form.Item label="Data de Nascimento"
                        name="data_nasc"
                        rules={[{ required: true, message: 'Por favor selecione a data' }]}>
                        <DatePicker  format={'DD/MM/YYYY'}></DatePicker>
                    </Form.Item>
                    <Form.Item label="Sexo"
                        name="sexo"
                        rules={[{ required: true, message: 'Por favor selecione o sexo' }]}>
                        <Select style={{ width: 120 }} >
                            <Option value="Masculino">Masculino</Option>
                            <Option value="Feminino">Feminino</Option>
                        </Select>
                    </Form.Item>
                    <Button style={{ position: "absolute", left: "50%" }} type="primary" htmlType="submit"><SaveFilled /> Cadastrar </Button>
                </Form>
                <Modal title="Confirmar Cadastro" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>

                    {!safePayload.nome ? <p>Nome invalido.</p> : void 0}
                    {!safePayload.rg ? <p>Rg invalido.</p> : void 0}
                    {!safePayload.cpf ? <p>CPF invalido.</p> : void 0}
                    {!safePayload.data_nasc ? <p>Data de nascimento invalida.</p> : void 0}
                    {!safePayload.sexo ? <p>Valor de sexo invalido.</p> : void 0}
                    {!safePayload.safeToRegister ? <p>Pessoa já cadastrada.</p> : void 0}
                    {safePayload.nome && safePayload.rg && safePayload.cpf && safePayload.data_nasc && safePayload.sexo && safePayload.safeToRegister ? <p>Confirmar cadastro?</p>:void 0 }

                </Modal>
            </Col>

        </div >
    )
}