import {Form, Input, Switch} from 'antd';
import {useState} from 'react';

const WebFormItem = () => {
  const [showInputs, setShowInputs] = useState(false);

  return (
    <>
      <Form.Item label="Web" valuePropName="checked" layout="horizontal">
        <Switch onChange={setShowInputs} />
      </Form.Item>
      {showInputs ? (
        <>
          <Form.Item
            label="Project Name"
            name={['react', 'name']}
            rules={[{required: true, message: 'Please input project name!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Project Path"
            name={['react', 'path']}
            rules={[{required: true, message: 'Please input project path!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Use TypeScritp"
            name={['react', 'useTypeScript']}
            valuePropName="checked"
            layout="horizontal"
          >
            <Switch />
          </Form.Item>
        </>
      ) : null}
    </>
  );
};

export default WebFormItem;
