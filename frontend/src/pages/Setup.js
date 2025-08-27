import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/^(?=.*\d)/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const Setup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setup } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return 'error';
    if (strength < 75) return 'warning';
    return 'success';
  };

  const getPasswordRequirements = (password) => [
    { text: 'At least 8 characters', met: password?.length >= 8 },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password || '') },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password || '') },
    { text: 'Contains number', met: /\d/.test(password || '') },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await setup(data);
      if (result.success) {
        toast.success('Admin account created successfully!');
      } else {
        toast.error(result.error || 'Setup failed');
      }
    } catch (error) {
      toast.error('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordRequirements = getPasswordRequirements(password);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={3}
      >
        <Card sx={{ width: '100%', maxWidth: 480 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom align="center">
                Initial Setup
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Create your admin account to get started with BIND9 WebUI
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              This is a one-time setup. You'll be able to log in with these credentials after completion.
            </Alert>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username"
                    placeholder="Enter admin username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    margin="normal"
                    autoComplete="username"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Password strength
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {passwordStrength}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={getPasswordStrengthColor(passwordStrength)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <List dense sx={{ mt: 1 }}>
                    {passwordRequirements.map((req, index) => (
                      <ListItem key={index} sx={{ py: 0, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {req.met ? (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={req.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: req.met ? 'success.main' : 'text.disabled',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    margin="normal"
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!isValid || loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Setup;
