import React, { useState, useEffect } from 'react';
import { Col, Modal } from 'antd';
import { validate } from 'gerador-validador-cpf'
import EditableTable from '../../components/EditableTable'

export default function Configurations() {
    //define states 
    var payloadInfo = {
        "nome": false,
        "cpf": false,
        "rg": false,
        "data_nasc": true,
        "sexo": false,
        "safeToRegister": true
    }

    var searchInput = {};

    const [persons, setPersons] = useState()
    const [safePayload, setSafePayload] = useState(payloadInfo)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [state, setState] = useState({
        searchText: '',
        searchedColumn: '',
    })
    const [formValue, setFormValue] = useState({
        "nome": "",
        "cpf": "",
        "rg": "",
        "data_nasc": "",
        "sexo": ""
    })

    //get the list of persons from the db and puts in the state
    function refreshPersons() {
        fetch('http://localhost:5000/pessoas', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(resp => resp.json()).then(setPersons)
    }

    //delete selected person
    function deletePerson(person) {
        fetch("http://localhost:5000/pessoas/" + person.id, {
            method: 'DELETE',
            redirect: 'follow'
        })
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
        refreshPersons();
    }
    //push the update of the person on db
    const onFinish = ((values) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("sexo", values.sexo);
        urlencoded.append("data_nasc", values.data_nasc);
        urlencoded.append("nome", values.nome);
        urlencoded.append("rg", values.rg);
        urlencoded.append("cpf", values.cpf);

        var requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch("http://localhost:5000/pessoas/" + values.id, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
        console.log("edited:"+values)
        refreshPersons();
    });
    //calculates the number of the persons currently showing in the table
    const personsCounter = (objPessoas) => {
        var counter = 0;
        try {
            if (state.searchText !== '' && state.searchText ) {
                persons.forEach((element) => {
                    return element[state.searchedColumn].toString().toLowerCase().includes(state.searchText.toLowerCase()) ? counter++ : void 0;
                })
                return counter;
            } else {
                return Object.keys(objPessoas).length
            }
        } catch {
            return 0
        }
    }
    //get the data from db for the firts table render
    useEffect(
        () => {
            refreshPersons();
        }, [])
    //switch case in the modal ok button
    const handleOk = () => {
        setIsModalVisible(false);
        if (safePayload.nome && safePayload.rg && safePayload.cpf && safePayload.sexo && safePayload.safeToRegister && safePayload.data_nasc) {
            onFinish(formValue);
        } else {
            refreshPersons();
        }
    };
    //modal handle from cancel button
    const handleCancel = () => {
        refreshPersons();
        setIsModalVisible(false);
    };
    //function that set state validating values from the forms for db registering
    const validateValues = (values) => {
        //validating name values
        (/^[ a-zA-ZçÇÁáÀàãÃóÓõÕéÉíÍ]+$/.test(values.nome)) ? payloadInfo.nome = true : payloadInfo.nome = false;

        //Validating CPF generating rules and parsing to db standard
        validate(values.cpf) ? payloadInfo.cpf = true : payloadInfo.cpf = false;
        values.cpf = values.cpf.toString().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

        //parsing RG to db standard
        (/^[0-9]+$/.test(values.rg)) ? payloadInfo.rg = true : payloadInfo.rg = false;
        values.rg = values.rg.toString().replace(/(\d{2,3})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");

        //validate date formatation to db standard 
        (/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(values.data_nasc)) ? payloadInfo.data_nasc = true : payloadInfo.data_nasc = false;

        //double-checking payload gender parameters  
        (values.sexo === "Masculino" || values.sexo === "Feminino") ? payloadInfo.sexo = true : payloadInfo.sexo = false;

        //checks if person is already registered
        persons.forEach((element) => {
            values.rg === element.rg ? payloadInfo.safeToRegister = false : void 0;
            values.cpf === element.cpf ? payloadInfo.safeToRegister = false : void 0;
        })

        setSafePayload(payloadInfo);
        setFormValue(values);
        setIsModalVisible(true);
    }

    
    //set the search state after the filter button was pressed
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    //clear search state and clear filter input
    const handleReset = clearFilters => {
        clearFilters();
        setState({ searchText: '' });
    };



    return (
        <div>
            <Col span={22} offset={1} >
                <h1 style={{ textAlign: "center" }}>Lista de Pessoas</h1>
                <EditableTable persons={persons} 
                setPersons={setPersons} 
                validateValues={validateValues} 
                deletePerson={deletePerson} 
                personsCounter={personsCounter} 
                searchInput={searchInput} 
                handleSearch={handleSearch} 
                handleReset={handleReset} 
                state={state} 
                setState={setState} />
                <Modal title="Confirmar Cadastro" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>

                    {!safePayload.nome ? <p>Nome invalido.</p> : void 0}
                    {!safePayload.rg ? <p>Rg invalido.</p> : void 0}
                    {!safePayload.cpf ? <p>CPF invalido.</p> : void 0}
                    {!safePayload.data_nasc ? <p>Data de nascimento invalida.</p> : void 0}
                    {!safePayload.sexo ? <p>Valor de sexo invalido.</p> : void 0}
                    {!safePayload.safeToRegister ? <p>Pessoa já cadastrada.</p> : void 0}
                    {safePayload.nome && safePayload.rg && safePayload.cpf && safePayload.data_nasc && safePayload.sexo && safePayload.safeToRegister ? <p>Confirmar cadastro?</p> : void 0}

                </Modal>
            </Col>
        </div>
    )
}