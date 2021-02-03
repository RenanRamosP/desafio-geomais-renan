import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography, Button, Col, Space, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { validate } from 'gerador-validador-cpf'

export default function Configurations() {

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

    function refreshPersons() {
        fetch('http://localhost:5000/pessoas', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(resp => resp.json()).then(setPersons)
    }

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

    const personsCounter = (objPessoas) => {
        var counter = 0;
        try {
            if (state.searchText !== '') {
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

    useEffect(
        () => {
            refreshPersons();
        }, [])

    const handleOk = () => {
        setIsModalVisible(false);
        if (safePayload.nome && safePayload.rg && safePayload.cpf && safePayload.sexo && safePayload.safeToRegister && safePayload.data_nasc) {
            onFinish(formValue);
        } else {
            refreshPersons();
        }
    };

    const handleCancel = () => {
        refreshPersons();
        setIsModalVisible(false);
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

        //validate date formatation to db standard 
        (/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(values.data_nasc)) ? payloadInfo.data_nasc = true : payloadInfo.data_nasc = false;

        //double-checking payload gender parameters  
        (values.sexo === "Masculino" || values.sexo === "Feminino") ? payloadInfo.sexo = true : payloadInfo.sexo = false;

        persons.forEach((element) => {
            values.rg === element.rg ? payloadInfo.safeToRegister = false : void 0;
            values.cpf === element.cpf ? payloadInfo.safeToRegister = false : void 0;
        })

        setSafePayload(payloadInfo);
        setFormValue(values);
        setIsModalVisible(true);
    }

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                  </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                  </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setState({
                                searchText: selectedKeys[0],
                                searchedColumn: dataIndex,
                            });
                        }}
                    >
                        Filter
                  </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        filteredValue: [state.searchText],
        onFilter: (value, record) => {
            if (state.searchedColumn === dataIndex) {
                return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '';
            } else {
                return true;
            }
        },
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput, 100);
            }
        },
        render: text =>
            state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                    text
                ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    const handleReset = clearFilters => {
        clearFilters();
        setState({ searchText: '' });
    };

    const EditableTable = () => {

        const EditableCell = ({
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        }) => {
            const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
            return (
                <td {...restProps}>
                    {editing ? (
                        <Form.Item
                            name={dataIndex}
                            style={{
                                margin: 0,
                            }}
                            rules={[
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ]}
                        >
                            {inputNode}
                        </Form.Item>
                    ) : (
                            children
                        )}
                </td>
            );
        };

        const [editingKey, setEditingKey] = useState('');

        const [form] = Form.useForm();


        const edit = (record) => {
            record.rg = record.rg.replace(/[.-]/g, '')
            record.cpf = record.cpf.replace(/[.-]/g, '')

            form.setFieldsValue({
                ...record,
            });
            setEditingKey(record.id);
        };

        const cancel = () => {
            setEditingKey('');
        };

        const isEditing = (record) => record.id === editingKey;

        const save = async (key) => {
            try {
                var row = await form.validateFields();
                row = { id: editingKey, ...row }
                const newData = [...persons];
                const index = newData.findIndex((item) => key === item.key);
                if (index > -1) {
                    const item = newData[index];
                    newData.splice(index, 1, { ...item, ...row });
                    setPersons(newData);
                    setEditingKey('');
                } else {
                    newData.push(row);
                    setPersons(newData);
                    setEditingKey('');
                }
                validateValues(row);

            } catch (errInfo) {
                console.log('Validate Failed:', errInfo);
            }
        };

        const columns = [
            {
                title: 'Nome',
                dataIndex: 'nome',
                width: '25%',
                editable: true,
                ...getColumnSearchProps('nome'),
            },
            {
                title: 'RG',
                dataIndex: 'rg',
                width: '14%',
                editable: true,
                ...getColumnSearchProps('rg'),
            },
            {
                title: 'CPF',
                dataIndex: 'cpf',
                width: '16%',
                editable: true,
                ...getColumnSearchProps('cpf'),
            },
            {
                title: 'Data de Nascimento',
                dataIndex: 'data_nasc',
                width: '15%',
                editable: true,
                ...getColumnSearchProps('data_nasc'),
            },
            {
                title: 'Sexo',
                dataIndex: 'sexo',
                width: '10%',
                editable: true,
                ...getColumnSearchProps('sexo'),
            },
            {
                title: 'Ações',
                dataIndex: 'acoes',
                render: (_, record) => {
                    const editable = isEditing(record);
                    return editable ? (
                        <span>
                            <Button
                                onClick={() => save(record.key)}
                                style={{
                                    marginRight: 8,
                                }}
                            >
                                Save
                            </Button>
                            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                                <Button>Cancel</Button>
                            </Popconfirm>
                        </span>
                    ) : (<>
                        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                            Editar
                            </Typography.Link>
                        <Typography.Link style={{ marginLeft: 15 }} disabled={editingKey !== ''} onClick={() => deletePerson(record)}>
                            Excluir
                            </Typography.Link>
                    </>


                        );
                },
            },
        ];
        const mergedColumns = columns.map((col) => {
            if (!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: (record) => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: isEditing(record),
                }),
            };
        });
        return (
            <Form form={form} component={false}>
                <h3>{personsCounter(persons)} Pessoas encontradas.</h3>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
                    dataSource={persons}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={{
                        onChange: cancel,
                    }}
                />
            </Form>
        );
    };

    return (
        <div>
            <Col span={22} offset={1} >
                <h1 style={{ textAlign: "center" }}>Lista de Pessoas</h1>
                <EditableTable />
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