import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message || 'Đăng nhập thất bại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-logo">
          <div className="login-logo-icon">🏖️</div>
          <h1>Tourism Management</h1>
        </div>

        <div className="login-container">
          <h2>Đăng nhập</h2>
          <p className="login-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Tên đăng nhập"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="thuhta75576"
            />
            <div>
              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••••••"
              />
              <div className="forgot-password">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                ⚠️ {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Đăng nhập
            </Button>
          </form>

          <div className="login-footer">
            Chưa có tài khoản?
            <Link to="/register">Đăng ký tại đây</Link>
          </div>
        </div>
      </div>

      <div className="login-right">
        <img 
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2835" 
          alt="Travel" 
          className="login-image"
        />
        <div className="login-overlay">
          <div className="login-overlay-content">
            <h2>Explore The World</h2>
            <p>Khám phá những điểm đến tuyệt vời và tạo những kỷ niệm khó quên</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
