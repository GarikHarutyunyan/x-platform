import { Button, Checkbox, Form, Input, Modal } from 'antd';
import './ProjectDialog.css';

const defaultPorjectConfig = {name: ''};

type Props = {
  onCancel: () => void;
  onConfirm: (config: { name: string; [key: string]: any }) => void;
};

function ProjectDialog({ onCancel, onConfirm }: Props) {

  const onFinish = (values: any) => {
    onConfirm(values)
  };

  return (
    <Modal
      open
      title="Enter Project Details"
      onCancel={onCancel}
      footer={null}
    >
      <Form
        layout="vertical"
        initialValues={defaultPorjectConfig}
        onFinish={onFinish}
      >
        <Form.Item label="Project Name" name="name" rules={[{ required: true, message: 'Please input project name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="server" valuePropName="checked">
          <Checkbox>Server</Checkbox>
        </Form.Item>
        <Form.Item name="web" valuePropName="checked">
          <Checkbox>Web</Checkbox>
        </Form.Item>
        <Form.Item name="mobile" valuePropName="checked">
          <Checkbox>Mobile</Checkbox>
        </Form.Item>
        <Form.Item name="desktop" valuePropName="checked">
          <Checkbox>Desktop</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            {'Create'}
          </Button>
          <Button onClick={onCancel}>
            {'Cancel'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ProjectDialog;
