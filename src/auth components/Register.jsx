import GenericForm from '../utils/GenericForm';
import { Text, Pressable } from 'react-native';
import api from '../utils/api';

const Register = ({ navigation }) => {
  const fields = [
    { name: 'name', label: 'Enter Name', placeholder: 'Name', required: true },
    {
      name: 'email',
      label: 'Enter Email',
      placeholder: 'E-mail',
      required: true,
      keyboardType: 'email-address',
    },
    {
      name: 'password',
      label: 'Enter Password',
      placeholder: 'Password',
      type: 'password',
      required: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm Password',
      type: 'password',
      required: true,
    },
    {
      name: 'phone',
      label: 'Enter Phone Number',
      placeholder: 'Number',
      required: true,
      keyboardType: 'numeric',
    },
  ];

  const handleSubmit = async data => {
    try {
      const res = await api.post('/register', data);
      if (res.data.success) {
        alert('User registered!');
        navigation.navigate('Login');
      } else {
        alert(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.log('Register error:', err);
      alert('Something went wrong');
    }
  };

  return (
    <GenericForm
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Register"
      headingTxt="Register"
      footerLink={
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            Already have an account?{' '}
            <Text style={{ color: '#D86C4E' }}>Sign In</Text>
          </Text>
        </Pressable>
      }
    />
  );
};

export default Register;
