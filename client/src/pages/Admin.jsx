import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/admin.service';
import uploadService from '../services/upload.service';

function Admin() {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'files'
  const [selectedOwner, setSelectedOwner] = useState('all'); // 'all' or username
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isAdmin: false
  });
  const [uploadData, setUploadData] = useState({
    selectedUser: '',
    file: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Admin access required') || err.message.includes('Invalid token')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    try {
      const newUser = await adminService.createUser(
        formData.username,
        formData.password,
        formData.isAdmin
      );
      
      // Добавляем нового пользователя в список
      setUsers([...users, newUser]);
      
      // Сбрасываем форму
      setFormData({ username: '', password: '', isAdmin: false });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Admin access required') || err.message.includes('Invalid token')) {
        navigate('/login');
      }
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      // Удаляем пользователя из списка
      setUsers(users.filter(user => user.id !== userId));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');
    setUploadLoading(true);
    setUploadSuccess(false);

    if (!uploadData.selectedUser || !uploadData.file) {
      setError('Please select a user and a file');
      setUploadLoading(false);
      return;
    }

    try {
      const result = await uploadService.uploadFileToUser(uploadData.file, uploadData.selectedUser);
      setUploadSuccess(true);
      setUploadData({ selectedUser: '', file: null });
      setTimeout(() => {
        setShowUploadForm(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const fetchAllFiles = async () => {
    setFilesLoading(true);
    try {
      const data = await uploadService.getAllFilesWithOwners();
      setFiles(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setFilesLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Получаем уникальных владельцев из списка файлов
  const getUniqueOwners = () => {
    const owners = new Set();
    files.forEach(file => {
      if (file.username) {
        owners.add(file.username);
      }
    });
    return Array.from(owners).sort();
  };

  // Фильтруем файлы по выбранному владельцу
  const getFilteredFiles = () => {
    if (selectedOwner === 'all') {
      return files;
    }
    if (selectedOwner === 'no-owner') {
      return files.filter(file => !file.username);
    }
    return files.filter(file => file.username === selectedOwner);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/10 via-gray-800/10 to-slate-800/10 backdrop-blur-[5px] border-b border-gray-200/30 px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="flex-shrink-0">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-2">Admin Panel</h1>
                  <p className="text-gray-600 text-xs sm:text-sm font-light">Manage all users in the system</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                  <button
                    onClick={() => navigate('/model')}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-300/30 cursor-pointer flex-shrink-0"
                    title="View 3D Models"
                  >
                    <span className="flex items-center whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="hidden sm:inline">3D Viewer</span>
                      <span className="sm:hidden">3D</span>
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/home')}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-300/30 cursor-pointer flex-shrink-0 whitespace-nowrap"
                    title="Go to home page"
                  >
                    Home
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900/90 backdrop-blur-md text-white rounded-lg hover:bg-gray-900 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-800/50 cursor-pointer flex-shrink-0 whitespace-nowrap"
                    title="Logout from admin panel"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="mb-6 sm:mb-8 border-b border-gray-200/50">
                <nav className="flex space-x-4 sm:space-x-8 md:space-x-12">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowCreateForm(false);
                      setShowUploadForm(false);
                    }}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-light text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === 'users'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('files');
                      setSelectedOwner('all'); // Сбрасываем фильтр при переключении
                      setShowUploadForm(false); // Скрываем форму загрузки при переключении
                      fetchAllFiles();
                    }}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-light text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === 'files'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    All Files
                  </button>
                </nav>
              </div>

              {activeTab === 'users' && (
                <>
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">All Users</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={refreshUsers}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-xs uppercase tracking-wider border border-gray-300/30 cursor-pointer flex-shrink-0"
                    title="Refresh users list"
                  >
                    <span className="flex items-center whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">↻</span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      setShowCreateForm(!showCreateForm);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:shadow-md transition-all font-light text-xs uppercase tracking-wider cursor-pointer flex-shrink-0 whitespace-nowrap"
                    title="Create new user"
                  >
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline">{showCreateForm ? 'Cancel' : 'Create User'}</span>
                      <span className="sm:hidden">{showCreateForm ? 'Cancel' : 'Create'}</span>
                    </span>
                  </button>
                    <div className="bg-gray-900/5 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-light uppercase tracking-wider border border-gray-300/30 flex-shrink-0 whitespace-nowrap">
                      {users.length} {users.length === 1 ? 'User' : 'Users'}
                    </div>
                  </div>
                </div>

                {showCreateForm && (
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg p-8 mb-8 border border-gray-200/30">
                    <h3 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Create New User</h3>
                    <form onSubmit={handleCreateUser} className="space-y-5">
                      <div>
                        <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg text-base outline-none transition-all focus:border-gray-400 focus:bg-white/80 font-light text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter username"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg text-base outline-none transition-all focus:border-gray-400 focus:bg-white/80 font-light text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter password"
                          required
                          minLength={3}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          checked={formData.isAdmin}
                          onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <label htmlFor="isAdmin" className="ml-2 text-sm font-light text-gray-700">
                          Admin privileges
                        </label>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={createLoading}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-lg text-sm font-light uppercase tracking-wider shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </span>
                        ) : (
                          'Create User'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
              
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500 text-lg">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {users.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isAdmin ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                                Admin
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="px-3 py-1.5 bg-gray-900/10 text-gray-700 rounded-lg hover:bg-gray-900/20 hover:shadow-sm transition-all font-light text-xs uppercase tracking-wider flex items-center cursor-pointer border border-gray-300/20"
                              title="Delete user"
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
                </>
              )}

              {activeTab === 'files' && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">All Files</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="text-xs sm:text-sm font-light text-gray-700 uppercase tracking-wider hidden sm:inline">Filter by Owner:</label>
                        <label className="text-xs sm:text-sm font-light text-gray-700 uppercase tracking-wider sm:hidden">Filter:</label>
                        <select
                          value={selectedOwner}
                          onChange={(e) => setSelectedOwner(e.target.value)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300/50 rounded-lg text-xs sm:text-sm outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-300 bg-white/70 text-gray-800 cursor-pointer"
                        >
                          <option value="all">All Owners</option>
                          <option value="no-owner">No Owner</option>
                          {getUniqueOwners().filter(o => o !== 'all' && o !== 'no-owner').map((owner) => (
                            <option key={owner} value={owner}>
                              {owner}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={fetchAllFiles}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-xs uppercase tracking-wider border border-gray-300/30 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                        disabled={filesLoading}
                        title="Refresh files list"
                      >
                        <span className="flex items-center whitespace-nowrap">
                          <svg className="w-3.5 h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">{filesLoading ? 'Loading...' : 'Refresh'}</span>
                          <span className="sm:hidden">↻</span>
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setShowUploadForm(!showUploadForm);
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:shadow-md transition-all font-light text-xs uppercase tracking-wider cursor-pointer flex-shrink-0 whitespace-nowrap"
                        title="Upload file to user folder"
                      >
                        <span className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="hidden sm:inline">{showUploadForm ? 'Cancel Upload' : 'Upload File'}</span>
                          <span className="sm:hidden">{showUploadForm ? 'Cancel' : 'Upload'}</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {showUploadForm && (
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-8 mb-8 border border-gray-200/30">
                      <h3 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Upload File to User Folder</h3>
                      {uploadSuccess && (
                        <div className="bg-white/60 backdrop-blur-sm border-l-4 border-gray-900 text-gray-700 p-3 rounded-r-lg mb-6">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-light">File uploaded successfully!</span>
                          </div>
                        </div>
                      )}
                      <form onSubmit={handleFileUpload} className="space-y-5">
                        <div>
                          <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                            Select User
                          </label>
                          <select
                            value={uploadData.selectedUser}
                            onChange={(e) => setUploadData({ ...uploadData, selectedUser: e.target.value })}
                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg text-base outline-none transition-all focus:border-gray-400 focus:bg-white/80 font-light text-gray-900"
                            required
                          >
                            <option value="">Choose a user...</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.username}>
                                {user.username} {user.isAdmin ? '(Admin)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                            Select File
                          </label>
                          <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-300/50 border-dashed rounded-lg cursor-pointer bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 font-light">
                                <span className="font-normal">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-400 font-light">.gltf, .glb, .jpg, .png, .pdf, .zip (MAX. 100MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept=".gltf,.glb,.jpg,.jpeg,.png,.gif,.pdf,.zip"
                            />
                          </label>
                          {uploadData.file && (
                            <div className="mt-2 px-3 py-2 bg-white/60 backdrop-blur-sm text-gray-700 rounded text-sm font-light border border-gray-300/30">
                              Selected: {uploadData.file.name} ({(uploadData.file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="submit"
                          disabled={uploadLoading || !uploadData.selectedUser || !uploadData.file}
                          className="w-full py-3.5 bg-gray-900 text-white rounded-lg text-sm font-light uppercase tracking-wider shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadLoading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            'Upload File'
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {filesLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600 text-lg">Loading files...</p>
                    </div>
                  ) : (() => {
                    const filteredFiles = getFilteredFiles();
                    return filteredFiles.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500 text-lg">
                          {selectedOwner === 'all' 
                            ? 'No files found' 
                            : selectedOwner === 'no-owner'
                            ? 'No files without owner found'
                            : `No files found for owner "${selectedOwner}"`}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">
                            Showing <span className="font-semibold">{filteredFiles.length}</span> of <span className="font-semibold">{files.length}</span> files
                            {selectedOwner !== 'all' && (
                              <span> for {selectedOwner === 'no-owner' ? 'files without owner' : `owner "${selectedOwner}"`}</span>
                            )}
                          </p>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Filename
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Owner
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {filteredFiles.map((file, index) => (
                            <tr key={`${file.username || 'no-owner'}-${file.filename}-${index}`} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3 text-xs">
                                    {file.filename.split('.').pop()?.toUpperCase().slice(0, 3) || 'FILE'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{file.url}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {file.username ? (
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-2 text-xs">
                                      {file.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{file.username}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">No owner</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <a
                                  href={`http://127.0.0.1:3000${file.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:scale-105 hover:shadow-md transition-all font-medium text-xs inline-flex items-center cursor-pointer"
                                  title="Open file"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Open
                                </a>
                              </td>
                            </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

