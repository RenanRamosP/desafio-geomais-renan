import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Menu, Card, Col, Row } from 'antd'
import { HomeOutlined, MenuOutlined } from '@ant-design/icons'
import './App.css';

import CreatePerson from './Pages/CreatePerson';
import ListPersons from './Pages/ListPersons'

const { SubMenu } = Menu;

export const Pages = {
  CreatePerson,
  ListPersons,
}

function App() {
  return (
    <Router>
      <Menu mode="horizontal" theme="dark">
        <SubMenu key="SubMenu" icon={<MenuOutlined />} title="">
          <Menu.Item> <Link to="/">Home</Link> </Menu.Item>
          <Menu.Item> <Link to="/CreatePerson">Cadastrar Pessoas</Link> </Menu.Item>
          <Menu.Item> <Link to="/ListPersons">Listar Pessoas</Link> </Menu.Item>
        </SubMenu>
      </Menu>
      <div >
        <Switch>
          {Object.keys(Pages).map(key => {
            return (<Route key={key} path={`/${key}`} component={Pages[key]} />)
          })}
          <Route path="/" component={() => (
            <div className="App">
              <h1>Desafio Geomais Front-end</h1>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title={<Link to='/CreatePerson' > Cadastrar Pessoas </Link>} bordered={false}>
                    Forms para adicionar pessoas ao banco de dados.
                    </Card>
                </Col>
                <Col span={12}>
                  <Card title={<Link to='/ListPersons' > Listar Pessoas </Link>} bordered={false}>
                    Tela para listar, buscar, deletar e editar pessoas do banco de dados.
                  </Card>
                </Col>

              </Row>

            </div>
          )} />

        </Switch>

      </div>
    </Router>
  );
}

export default App;
