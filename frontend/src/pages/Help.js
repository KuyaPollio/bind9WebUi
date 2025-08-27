import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Launch as LaunchIcon,
  Settings as SettingsIcon,
  Dns as DnsIcon,
} from '@mui/icons-material';

const Help = () => {
  const [expanded, setExpanded] = useState('getting-started');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const recordTypes = [
    { type: 'A', description: 'Maps a hostname to an IPv4 address', example: 'www IN A 192.168.1.10' },
    { type: 'AAAA', description: 'Maps a hostname to an IPv6 address', example: 'www IN AAAA 2001:db8::1' },
    { type: 'CNAME', description: 'Creates an alias for another hostname', example: 'mail IN CNAME www' },
    { type: 'MX', description: 'Specifies mail exchange servers', example: '@ IN MX 10 mail.example.com.' },
    { type: 'NS', description: 'Specifies name servers for the zone', example: '@ IN NS ns1.example.com.' },
    { type: 'PTR', description: 'Maps IP addresses to hostnames (reverse DNS)', example: '10 IN PTR www.example.com.' },
    { type: 'SOA', description: 'Start of Authority record for the zone', example: '@ IN SOA ns1.example.com. admin.example.com. (...)' },
    { type: 'SRV', description: 'Service location record', example: '_sip._tcp IN SRV 10 60 5060 sip.example.com.' },
    { type: 'TXT', description: 'Text records for various purposes', example: '@ IN TXT "v=spf1 include:_spf.google.com ~all"' },
  ];

  const commonDirectives = [
    { directive: '$TTL', description: 'Sets default Time To Live for records', example: '$TTL 86400' },
    { directive: '$ORIGIN', description: 'Sets the domain name to append to relative names', example: '$ORIGIN example.com.' },
    { directive: '@', description: 'Represents the current domain (zone origin)', example: '@ IN A 192.168.1.10' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Help & Documentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete guide to managing BIND9 DNS server configuration and zone files
        </Typography>
      </Box>

      {/* Quick Links */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Configuration Files</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Learn how to edit BIND9 configuration files and understand their structure.
              </Typography>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                onClick={() => setExpanded('configuration')}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <DnsIcon color="primary" />
                <Typography variant="h6">DNS Records</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Understand different DNS record types and how to configure them properly.
              </Typography>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                onClick={() => setExpanded('records')}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CodeIcon color="primary" />
                <Typography variant="h6">Best Practices</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Follow DNS best practices for security, performance, and reliability.
              </Typography>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                onClick={() => setExpanded('best-practices')}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Documentation */}
      <Box>
        {/* Getting Started */}
        <Accordion expanded={expanded === 'getting-started'} onChange={handleChange('getting-started')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This web interface provides a user-friendly way to manage your BIND9 DNS server. 
                  You can edit configuration files, manage DNS zones, and monitor server logs all from this dashboard.
                </Typography>
              </Alert>
              
              <Typography variant="h6" gutterBottom>Quick Start Guide</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="1. Create DNS Zones" 
                    secondary="Start by creating zone files for your domains in the DNS Records section"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="2. Configure Records" 
                    secondary="Add A, CNAME, MX, and other DNS records to your zones"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="3. Update Configuration" 
                    secondary="Modify BIND9 configuration files if needed in the Configuration section"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="4. Monitor Logs" 
                    secondary="Check server logs to ensure everything is working correctly"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Configuration Files */}
        <Accordion expanded={expanded === 'configuration'} onChange={handleChange('configuration')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">BIND9 Configuration Files</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body1" gutterBottom>
                BIND9 uses several configuration files to define how the DNS server operates:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      named.conf
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Main configuration file that defines global options and includes other configuration files.
                    </Typography>
                    <Box component="pre" sx={{ 
                      bgcolor: 'background.default', 
                      p: 2, 
                      borderRadius: 1, 
                      fontSize: '0.875rem',
                      overflow: 'auto'
                    }}>
{`options {
    directory "/var/cache/bind";
    forwarders {
        8.8.8.8;
        1.1.1.1;
    };
    dnssec-validation auto;
    listen-on { any; };
    allow-query { any; };
};

include "/etc/bind/named.conf.local";`}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      named.conf.local
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Local configuration file where you define your custom zones.
                    </Typography>
                    <Box component="pre" sx={{ 
                      bgcolor: 'background.default', 
                      p: 2, 
                      borderRadius: 1, 
                      fontSize: '0.875rem',
                      overflow: 'auto'
                    }}>
{`zone "example.com" {
    type master;
    file "/var/lib/bind/db.example.com";
};

zone "1.168.192.in-addr.arpa" {
    type master;
    file "/var/lib/bind/db.192.168.1";
};`}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Always validate your configuration before applying changes. 
                  Use the "Validate Syntax" button in the Configuration Editor to check for errors.
                </Typography>
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* DNS Records */}
        <Accordion expanded={expanded === 'records'} onChange={handleChange('records')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">DNS Record Types</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body1" gutterBottom>
                Understanding DNS record types is essential for proper DNS configuration:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Record Type</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Example</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordTypes.map((record) => (
                      <TableRow key={record.type}>
                        <TableCell>
                          <Chip label={record.type} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>
                          <Box component="code" sx={{ 
                            bgcolor: 'background.default', 
                            p: 0.5, 
                            borderRadius: 0.5,
                            fontSize: '0.875rem'
                          }}>
                            {record.example}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Zone File Directives</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Directive</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Example</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commonDirectives.map((directive) => (
                      <TableRow key={directive.directive}>
                        <TableCell>
                          <Chip label={directive.directive} size="small" color="secondary" variant="outlined" />
                        </TableCell>
                        <TableCell>{directive.description}</TableCell>
                        <TableCell>
                          <Box component="code" sx={{ 
                            bgcolor: 'background.default', 
                            p: 0.5, 
                            borderRadius: 0.5,
                            fontSize: '0.875rem'
                          }}>
                            {directive.example}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Zone File Examples */}
        <Accordion expanded={expanded === 'examples'} onChange={handleChange('examples')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Zone File Examples</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>Complete Zone File Example</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box component="pre" sx={{ 
                  bgcolor: 'background.default', 
                  p: 2, 
                  borderRadius: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
{`$TTL 86400
@       IN      SOA     ns1.example.com. admin.example.com. (
                        2024082701      ; Serial (YYYYMMDDNN)
                        3600            ; Refresh (1 hour)
                        1800            ; Retry (30 minutes)
                        1209600         ; Expire (2 weeks)
                        86400 )         ; Minimum TTL (1 day)

; Name servers
@       IN      NS      ns1.example.com.
@       IN      NS      ns2.example.com.

; A records (IPv4 addresses)
@       IN      A       192.168.1.10
ns1     IN      A       192.168.1.10
ns2     IN      A       192.168.1.11
www     IN      A       192.168.1.10
mail    IN      A       192.168.1.12

; AAAA records (IPv6 addresses)
www     IN      AAAA    2001:db8::10

; CNAME records (aliases)
ftp     IN      CNAME   www
blog    IN      CNAME   www

; MX records (mail exchange)
@       IN      MX      10      mail.example.com.
@       IN      MX      20      backup-mail.example.com.

; TXT records
@       IN      TXT     "v=spf1 include:_spf.google.com ~all"
_dmarc  IN      TXT     "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"

; SRV records
_sip._tcp       IN      SRV     10 60 5060 sip.example.com.
_xmpp._tcp      IN      SRV     5  0  5222 xmpp.example.com.`}
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom>Reverse DNS Zone Example</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box component="pre" sx={{ 
                  bgcolor: 'background.default', 
                  p: 2, 
                  borderRadius: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
{`$TTL 86400
@       IN      SOA     ns1.example.com. admin.example.com. (
                        2024082701      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        1209600         ; Expire
                        86400 )         ; Minimum TTL

; Name servers
@       IN      NS      ns1.example.com.
@       IN      NS      ns2.example.com.

; PTR records (reverse DNS)
10      IN      PTR     www.example.com.
11      IN      PTR     ns2.example.com.
12      IN      PTR     mail.example.com.`}
                </Box>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Best Practices */}
        <Accordion expanded={expanded === 'best-practices'} onChange={handleChange('best-practices')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Best Practices & Security</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Do's
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Use consistent TTL values" 
                        secondary="Set appropriate TTL based on how often records change"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Always backup before changes" 
                        secondary="The system automatically creates backups for you"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Use FQDN (Fully Qualified Domain Names)" 
                        secondary="End domain names with a dot (e.g., example.com.)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Increment serial numbers" 
                        secondary="Use YYYYMMDDNN format for easy tracking"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Validate configuration syntax" 
                        secondary="Always use the validation feature before applying changes"
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Don'ts
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't use very low TTL values" 
                        secondary="This can increase DNS query load unnecessarily"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't forget trailing dots" 
                        secondary="Missing dots can cause unexpected behavior"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't skip validation" 
                        secondary="Invalid syntax can break DNS resolution"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't use duplicate serial numbers" 
                        secondary="Secondary servers may not update properly"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't expose internal IPs" 
                        secondary="Use split-horizon DNS for internal resources"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Troubleshooting */}
        <Accordion expanded={expanded === 'troubleshooting'} onChange={handleChange('troubleshooting')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Troubleshooting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>Common Issues & Solutions</Typography>
              
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">DNS not resolving</Typography>
                <Typography variant="body2">
                  Check that your zone files are properly referenced in named.conf.local and that the BIND9 service is running.
                </Typography>
              </Alert>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">Configuration syntax errors</Typography>
                <Typography variant="body2">
                  Use the "Validate Syntax" feature in the Configuration Editor. Check for missing semicolons and braces.
                </Typography>
              </Alert>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">Zone transfers not working</Typography>
                <Typography variant="body2">
                  Ensure serial numbers are properly incremented and check network connectivity between DNS servers.
                </Typography>
              </Alert>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Useful Commands for Testing</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box component="pre" sx={{ 
                  bgcolor: 'background.default', 
                  p: 2, 
                  borderRadius: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
{`# Test DNS resolution
nslookup example.com localhost

# Query specific record type
dig @localhost example.com MX

# Test reverse DNS
dig @localhost -x 192.168.1.10

# Check zone file syntax
named-checkzone example.com /path/to/zone/file

# Check configuration syntax
named-checkconf /path/to/named.conf`}
                </Box>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* External Resources */}
        <Accordion expanded={expanded === 'resources'} onChange={handleChange('resources')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">External Resources</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body1" gutterBottom>
                Additional resources for learning more about BIND9 and DNS:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://bind9.readthedocs.io/" target="_blank" rel="noopener">
                          Official BIND9 Documentation
                        </Link>
                      </ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://www.isc.org/bind/" target="_blank" rel="noopener">
                          ISC BIND Homepage
                        </Link>
                      </ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://tools.ietf.org/rfc/rfc1035.txt" target="_blank" rel="noopener">
                          RFC 1035 - Domain Names Implementation
                        </Link>
                      </ListItemText>
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://www.dns-sd.org/" target="_blank" rel="noopener">
                          DNS Service Discovery
                        </Link>
                      </ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://dnssec-deployment.org/" target="_blank" rel="noopener">
                          DNSSEC Deployment Guide
                        </Link>
                      </ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LaunchIcon color="primary" /></ListItemIcon>
                      <ListItemText>
                        <Link href="https://www.cloudflare.com/learning/dns/" target="_blank" rel="noopener">
                          DNS Learning Center
                        </Link>
                      </ListItemText>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Help;
