import React, { useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';


export default function EditableTable({ persons, setPersons,validateValues,deletePerson,personsCounter, searchInput,handleSearch,handleReset,state ,setState}) {
    // column component that creates the filters structure 
    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Buscar ${dataIndex}`}
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
                        Buscar
                  </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Limpar
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
                        Filtrar
                  </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        filteredValue: [state.searchText],
        onFilter: (value, record) => {
            if (state.searchedColumn === dataIndex && value) {
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
    //component that renders forms/input substitutes for table fields 
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

    //set the edited person key and replaces values to validations standards
    const edit = (record) => {
        record.rg = record.rg.replace(/[.-]/g, '')
        record.cpf = record.cpf.replace(/[.-]/g, '')

        form.setFieldsValue({
            ...record,
        });
        setEditingKey(record.id);
    };
    //cancel edit handler(clear the editing key state)
    const cancel = () => {
        setEditingKey('');
    };
    //state that returns true if the table is under edition in a row
    const isEditing = (record) => record.id === editingKey;

    //set the new edited data to the persons state and then proceeds to validate function
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

    //columns definition to create table structure
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
                            Salvar
                        </Button>
                        <Popconfirm title="Cancelar?" onConfirm={cancel}>
                            <Button>Cancelar</Button>
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
    //merges the columns structure setting index, titles and editing flags for each row
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