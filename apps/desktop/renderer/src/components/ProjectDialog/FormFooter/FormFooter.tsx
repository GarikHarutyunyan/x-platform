import {Button, Flex} from 'antd';

interface IFormFooterProps {
  onCancel: () => void;
}

const FormFooter = ({onCancel}: IFormFooterProps) => {
  return (
    <Flex justify="flex-end" align="center" style={{marginTop: 16}} gap={16}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" htmlType="submit">
        Create
      </Button>
    </Flex>
  );
};

export default FormFooter;
