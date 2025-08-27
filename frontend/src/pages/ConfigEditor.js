import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Fab,
} from '@mui/material';
import {
  Settings,
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  CheckCircle,
  Warning,
  Refresh,
  Visibility,
  Download,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { configAPI } from '../services/api';

const ConfigEditor = () => {
  const [configFiles, setConfigFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    loadConfigFiles();
  }, []);

  const loadConfigFiles = async () => {
    setLoading(true);
    try {
      const response = await configAPI.getFiles();
      setConfigFiles(response.data.files || []);
    } catch (error) {
      console.error('Error loading config files:', error);
      toast.error('Failed to load configuration files');
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filename) => {
    try {
      const response = await configAPI.getFile(filename);
      const content = response.data.content || '';
      setFileContent(content);
      setOriginalContent(content);
      setSelectedFile({ ...response.data, name: filename });
      setIsEditing(false);
      setValidation(null);
    } catch (error) {
      console.error('Error loading file content:', error);
      toast.error('Failed to load file content');
    }
  };

  const validateContent = async (content) => {
    if (!content.trim()) return;
    
    setValidating(true);
    try {
      const response = await configAPI.validate(content);
      setValidation(response.data);
    } catch (error) {
      console.error('Error validating content:', error);
      setValidation({ valid: false, errors: ['Validation failed'] });
    } finally {
      setValidating(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      await configAPI.updateFile(selectedFile.name, fileContent);
      setOriginalContent(fileContent);
      setIsEditing(false);
      toast.success('Configuration file saved successfully');
      
      // Refresh file list to update modification times
      loadConfigFiles();
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save configuration file');
    } finally {
      setSaving(false);
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) return;

    try {
      await configAPI.createFile(newFileName, '// New BIND9 configuration file\n\n');
      setCreateDialogOpen(false);
      setNewFileName('');
      toast.success('Configuration file created successfully');
      loadConfigFiles();
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Failed to create configuration file');
    }
  };

  const deleteFile = async () => {
    if (!selectedFile) return;

    try {
      await configAPI.deleteFile(selectedFile.name);
      setDeleteDialogOpen(false);
      setSelectedFile(null);
      setFileContent('');
      setOriginalContent('');
      toast.success('Configuration file deleted successfully');
      loadConfigFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete configuration file');
    }
  };

  const handleEditorChange = (value) => {
    setFileContent(value || '');
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setFileContent(originalContent);
    setIsEditing(false);
    setValidation(null);
  };

  const downloadFile = () => {
    if (!selectedFile || !fileContent) return;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasChanges = fileContent !== originalContent;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Configuration Editor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Edit BIND9 configuration files with syntax validation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadConfigFiles}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* File List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Configuration Files</Typography>
                <Tooltip title="Create new file">
                  <IconButton
                    color="primary"
                    onClick={() => setCreateDialogOpen(true)}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading files...
                </Typography>
              ) : configFiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No configuration files found
                </Typography>
              ) : (
                <List dense>
                  {configFiles.map((file) => (
                    <ListItem key={file.name} disablePadding>
                      <ListItemButton
                        selected={selectedFile?.name === file.name}
                        onClick={() => loadFileContent(file.name)}
                      >
                        <ListItemIcon>
                          <Settings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB • ${format(new Date(file.modified), 'MMM dd, HH:mm')}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Editor */}
        <Grid item xs={12} md={8}>
          {selectedFile ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">{selectedFile.name}</Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip
                        size="small"
                        label={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={format(new Date(selectedFile.modified), 'MMM dd, yyyy HH:mm')}
                        variant="outlined"
                      />
                      {hasChanges && (
                        <Chip
                          size="small"
                          label="Modified"
                          color="warning"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={1}>
                    <Tooltip title="Download file">
                      <IconButton onClick={downloadFile} size="small">
                        <Download />
                      </IconButton>
                    </Tooltip>
                    
                    {isEditing ? (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={cancelEditing}
                          size="small"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={saveFile}
                          disabled={saving || !hasChanges}
                          size="small"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                          size="small"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setDeleteDialogOpen(true)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Validation Results */}
                {validation && (
                  <Box mb={2}>
                    {validation.valid ? (
                      <Alert severity="success" icon={<CheckCircle />}>
                        Configuration syntax is valid
                      </Alert>
                    ) : (
                      <Alert severity="error">
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Configuration has syntax errors:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {validation.errors.map((error, index) => (
                            <li key={index}>
                              <Typography variant="body2">{error}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                    
                    {validation.warnings && validation.warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Warnings:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>
                              <Typography variant="body2">{warning}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Code Editor */}
                <Paper variant="outlined" sx={{ height: 500, overflow: 'hidden' }}>
                  <Editor
                    height="500px"
                    language="plaintext"
                    value={fileContent}
                    onChange={handleEditorChange}
                    options={{
                      readOnly: !isEditing,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      folding: true,
                      automaticLayout: true,
                    }}
                    theme="vs"
                  />
                </Paper>

                {isEditing && (
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => validateContent(fileContent)}
                      disabled={validating || !fileContent.trim()}
                    >
                      {validating ? 'Validating...' : 'Validate Syntax'}
                    </Button>
                    
                    <Typography variant="body2" color="text.secondary">
                      {hasChanges ? 'You have unsaved changes' : 'No changes'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Paper
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Settings sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                Select a configuration file to edit
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Choose a file from the list on the left to start editing
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create File Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Configuration File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            placeholder="e.g., named.conf.custom"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            helperText="Enter a name for the new configuration file"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={createFile} variant="contained" disabled={!newFileName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Configuration File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedFile?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. A backup will be created automatically.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteFile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for creating new files */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ConfigEditor;
