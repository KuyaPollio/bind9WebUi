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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Dns,
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  Refresh,
  Download,
  Visibility,
  Storage,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { recordsAPI } from '../services/api';

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];

const getRecordTypeColor = (type) => {
  const colors = {
    'A': 'primary',
    'AAAA': 'secondary',
    'CNAME': 'info',
    'MX': 'warning',
    'NS': 'success',
    'SOA': 'error',
    'TXT': 'default',
    'SRV': 'info',
    'PTR': 'secondary'
  };
  return colors[type] || 'default';
};

const RecordManager = () => {
  const [zoneFiles, setZoneFiles] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneContent, setZoneContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'editor'
  const [createZoneDialogOpen, setCreateZoneDialogOpen] = useState(false);
  const [deleteZoneDialogOpen, setDeleteZoneDialogOpen] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    filename: '',
    zoneName: '',
    adminEmail: '',
    ttl: 86400,
  });
  
  // Table editing state
  const [editingRecord, setEditingRecord] = useState(null);
  const [addingRecord, setAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    name: '',
    ttl: 86400,
    type: 'A',
    value: ''
  });

  useEffect(() => {
    loadZoneFiles();
  }, []);

  const loadZoneFiles = async () => {
    setLoading(true);
    try {
      const response = await recordsAPI.getZones();
      setZoneFiles(response.data.zones || []);
    } catch (error) {
      console.error('Error loading zone files:', error);
      toast.error('Failed to load zone files');
    } finally {
      setLoading(false);
    }
  };

  const loadZoneContent = async (filename) => {
    try {
      const response = await recordsAPI.getZone(filename);
      const content = response.data.content || '';
      setZoneContent(content);
      setOriginalContent(content);
      setRecords(response.data.records || []);
      setSelectedZone({ ...response.data, name: filename });
      setIsEditing(false);
    } catch (error) {
      console.error('Error loading zone content:', error);
      toast.error('Failed to load zone content');
    }
  };

  const saveZone = async () => {
    if (!selectedZone) return;

    setSaving(true);
    try {
      const response = await recordsAPI.updateZone(selectedZone.name, zoneContent);
      setOriginalContent(zoneContent);
      setRecords(response.data.records || []);
      setIsEditing(false);
      toast.success('Zone file saved successfully');
      
      // Refresh zone list to update modification times
      loadZoneFiles();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Failed to save zone file');
    } finally {
      setSaving(false);
    }
  };

  const createZone = async () => {
    if (!newZoneData.filename.trim() || !newZoneData.zoneName.trim() || !newZoneData.adminEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await recordsAPI.createZone(newZoneData);
      setCreateZoneDialogOpen(false);
      setNewZoneData({ filename: '', zoneName: '', adminEmail: '', ttl: 86400 });
      toast.success('Zone file created successfully');
      loadZoneFiles();
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error('Failed to create zone file');
    }
  };

  const deleteZone = async () => {
    if (!selectedZone) return;

    try {
      await recordsAPI.deleteZone(selectedZone.name);
      setDeleteZoneDialogOpen(false);
      setSelectedZone(null);
      setZoneContent('');
      setOriginalContent('');
      setRecords([]);
      toast.success('Zone file deleted successfully');
      loadZoneFiles();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone file');
    }
  };

  const handleEditorChange = (value) => {
    setZoneContent(value || '');
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setZoneContent(originalContent);
    setIsEditing(false);
  };

  const downloadZone = () => {
    if (!selectedZone || !zoneContent) return;

    const blob = new Blob([zoneContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedZone.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      'A': 'primary',
      'AAAA': 'secondary',
      'CNAME': 'info',
      'MX': 'warning',
      'NS': 'success',
      'SOA': 'error',
      'TXT': 'default',
      'SRV': 'info',
      'PTR': 'secondary',
    };
    return colors[type] || 'default';
  };

  const hasChanges = zoneContent !== originalContent;

  // Table editing functions
  const startEditingRecord = (index) => {
    setEditingRecord(index);
  };

  const cancelEditingRecord = () => {
    setEditingRecord(null);
  };

  const saveEditingRecord = (index, updatedRecord) => {
    const updatedRecords = [...records];
    updatedRecords[index] = updatedRecord;
    setRecords(updatedRecords);
    setEditingRecord(null);
    updateZoneContentFromRecords(updatedRecords);
  };

  const deleteRecord = (index) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    updateZoneContentFromRecords(updatedRecords);
  };

  const startAddingRecord = () => {
    setAddingRecord(true);
    setNewRecord({
      name: '',
      ttl: 86400,
      type: 'A',
      value: ''
    });
  };

  const cancelAddingRecord = () => {
    setAddingRecord(false);
  };

  const saveNewRecord = () => {
    if (!newRecord.name || !newRecord.value) {
      toast.error('Name and value are required');
      return;
    }
    
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    setAddingRecord(false);
    updateZoneContentFromRecords(updatedRecords);
  };

  const updateZoneContentFromRecords = (updatedRecords) => {
    // Convert records back to zone file format
    const lines = [];
    
    // Add TTL directive if not present
    if (updatedRecords.length > 0) {
      lines.push('$TTL 86400');
      lines.push('');
    }
    
    // Add SOA record first if present
    const soaRecords = updatedRecords.filter(r => r.type === 'SOA');
    const otherRecords = updatedRecords.filter(r => r.type !== 'SOA');
    
    [...soaRecords, ...otherRecords].forEach(record => {
      const ttl = record.ttl !== 86400 ? ` ${record.ttl}` : '';
      lines.push(`${record.name}${ttl} IN ${record.type} ${record.value}`);
    });
    
    const newContent = lines.join('\n');
    setZoneContent(newContent);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            DNS Record Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage DNS zones and records for your BIND9 server
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadZoneFiles}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Zone List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">DNS Zones</Typography>
                <Tooltip title="Create new zone">
                  <IconButton
                    color="primary"
                    onClick={() => setCreateZoneDialogOpen(true)}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading zones...
                </Typography>
              ) : zoneFiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No zone files found
                </Typography>
              ) : (
                <List dense>
                  {zoneFiles.map((zone) => (
                    <ListItem key={zone.name} disablePadding>
                      <ListItemButton
                        selected={selectedZone?.name === zone.name}
                        onClick={() => loadZoneContent(zone.name)}
                      >
                        <ListItemIcon>
                          <Dns fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={zone.zoneName || zone.name}
                          secondary={`${(zone.size / 1024).toFixed(1)} KB • ${format(new Date(zone.modified), 'MMM dd, HH:mm')}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Zone Content */}
        <Grid item xs={12} md={8}>
          {selectedZone ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">{selectedZone.zoneName || selectedZone.name}</Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip
                        size="small"
                        label={`${(selectedZone.size / 1024).toFixed(1)} KB`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`${records.length} records`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={format(new Date(selectedZone.modified), 'MMM dd, yyyy HH:mm')}
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
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setViewMode(viewMode === 'table' ? 'editor' : 'table')}
                      startIcon={viewMode === 'table' ? <Edit /> : <Storage />}
                    >
                      {viewMode === 'table' ? 'Editor' : 'Table'}
                    </Button>
                    
                    <Tooltip title="Download zone file">
                      <IconButton onClick={downloadZone} size="small">
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
                          onClick={saveZone}
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
                          onClick={() => setDeleteZoneDialogOpen(true)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Table View */}
                {viewMode === 'table' && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">DNS Records</Typography>
                      {isEditing && (
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={startAddingRecord}
                          size="small"
                        >
                          Add Record
                        </Button>
                      )}
                    </Box>
                    
                    {records.length === 0 && !addingRecord ? (
                      <Alert severity="info">
                        No DNS records found in this zone file.
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>TTL</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Value</TableCell>
                              {isEditing && <TableCell>Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* Add new record row */}
                            {addingRecord && (
                              <TableRow>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={newRecord.name}
                                    onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                                    placeholder="e.g., www"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={newRecord.ttl}
                                    onChange={(e) => setNewRecord({...newRecord, ttl: parseInt(e.target.value) || 86400})}
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    select
                                    size="small"
                                    value={newRecord.type}
                                    onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                                    fullWidth
                                  >
                                    {RECORD_TYPES.map((type) => (
                                      <MenuItem key={type} value={type}>
                                        {type}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    value={newRecord.value}
                                    onChange={(e) => setNewRecord({...newRecord, value: e.target.value})}
                                    placeholder="e.g., 192.168.1.10"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" gap={1}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={saveNewRecord}
                                    >
                                      <Save />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={cancelAddingRecord}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                            
                            {/* Existing records */}
                            {records.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {editingRecord === index ? (
                                    <TextField
                                      size="small"
                                      value={record.name}
                                      onChange={(e) => {
                                        const updatedRecord = {...record, name: e.target.value};
                                        const updatedRecords = [...records];
                                        updatedRecords[index] = updatedRecord;
                                        setRecords(updatedRecords);
                                      }}
                                      fullWidth
                                    />
                                  ) : (
                                    <Typography variant="body2" fontFamily="monospace">
                                      {record.name}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingRecord === index ? (
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={record.ttl}
                                      onChange={(e) => {
                                        const updatedRecord = {...record, ttl: parseInt(e.target.value) || 86400};
                                        const updatedRecords = [...records];
                                        updatedRecords[index] = updatedRecord;
                                        setRecords(updatedRecords);
                                      }}
                                      fullWidth
                                    />
                                  ) : (
                                    <Typography variant="body2" fontFamily="monospace">
                                      {record.ttl}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingRecord === index ? (
                                    <TextField
                                      select
                                      size="small"
                                      value={record.type}
                                      onChange={(e) => {
                                        const updatedRecord = {...record, type: e.target.value};
                                        const updatedRecords = [...records];
                                        updatedRecords[index] = updatedRecord;
                                        setRecords(updatedRecords);
                                      }}
                                      fullWidth
                                    >
                                      {RECORD_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                          {type}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  ) : (
                                    <Chip
                                      size="small"
                                      label={record.type}
                                      color={getRecordTypeColor(record.type)}
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingRecord === index ? (
                                    <TextField
                                      size="small"
                                      value={record.value}
                                      onChange={(e) => {
                                        const updatedRecord = {...record, value: e.target.value};
                                        const updatedRecords = [...records];
                                        updatedRecords[index] = updatedRecord;
                                        setRecords(updatedRecords);
                                      }}
                                      fullWidth
                                    />
                                  ) : (
                                    <Typography 
                                      variant="body2" 
                                      fontFamily="monospace"
                                      sx={{ 
                                        wordBreak: 'break-all',
                                        maxWidth: 300,
                                      }}
                                    >
                                      {record.value}
                                    </Typography>
                                  )}
                                </TableCell>
                                {isEditing && (
                                  <TableCell>
                                    <Box display="flex" gap={1}>
                                      {editingRecord === index ? (
                                        <>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => saveEditingRecord(index, record)}
                                          >
                                            <Save />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={cancelEditingRecord}
                                          >
                                            <Cancel />
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => startEditingRecord(index)}
                                          >
                                            <Edit />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => deleteRecord(index)}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </>
                                      )}
                                    </Box>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Editor View */}
                {viewMode === 'editor' && (
                  <Box>
                    <Paper variant="outlined" sx={{ height: 500, overflow: 'hidden' }}>
                      <Editor
                        height="500px"
                        language="plaintext"
                        value={zoneContent}
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
                        <Typography variant="body2" color="text.secondary">
                          Edit the zone file directly. Changes will be parsed automatically.
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {hasChanges ? 'You have unsaved changes' : 'No changes'}
                        </Typography>
                      </Box>
                    )}
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
              <Dns sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                Select a DNS zone to manage
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Choose a zone from the list on the left to view and edit records
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create Zone Dialog */}
      <Dialog open={createZoneDialogOpen} onClose={() => setCreateZoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New DNS Zone</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Zone Filename"
            placeholder="e.g., db.example.com"
            fullWidth
            value={newZoneData.filename}
            onChange={(e) => setNewZoneData({ ...newZoneData, filename: e.target.value })}
            helperText="Filename for the zone file"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Zone Name"
            placeholder="e.g., example.com"
            fullWidth
            value={newZoneData.zoneName}
            onChange={(e) => setNewZoneData({ ...newZoneData, zoneName: e.target.value })}
            helperText="Domain name for this zone"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Admin Email"
            placeholder="e.g., admin@example.com"
            type="email"
            fullWidth
            value={newZoneData.adminEmail}
            onChange={(e) => setNewZoneData({ ...newZoneData, adminEmail: e.target.value })}
            helperText="Administrator email address"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Default TTL"
            type="number"
            fullWidth
            value={newZoneData.ttl}
            onChange={(e) => setNewZoneData({ ...newZoneData, ttl: parseInt(e.target.value) || 86400 })}
            helperText="Default Time To Live in seconds"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateZoneDialogOpen(false)}>Cancel</Button>
          <Button onClick={createZone} variant="contained">
            Create Zone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Zone Dialog */}
      <Dialog open={deleteZoneDialogOpen} onClose={() => setDeleteZoneDialogOpen(false)}>
        <DialogTitle>Delete DNS Zone</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the zone <strong>{selectedZone?.zoneName || selectedZone?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. A backup will be created automatically.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteZoneDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteZone} color="error" variant="contained">
            Delete Zone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for creating new zones */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateZoneDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default RecordManager;
