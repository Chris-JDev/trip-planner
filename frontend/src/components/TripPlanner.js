import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function TripPlanner() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [dates, setDates] = useState({start: '', end: ''});

  const handleInput = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      const res = await axios.get(`http://127.0.0.1:5000/autocomplete?input=${val}`);
      setSuggestions(res.data.suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addStop = (city) => {
    if (city && !selectedStops.includes(city)) {
      setSelectedStops([...selectedStops, city]);
    }
    setQuery('');
    setSuggestions([]);
  };

  const startPlanning = async () => {
    if (selectedStops.length < 2) {
      alert("Add at least 2 stops");
      return;
    }
    const res = await axios.post('http://127.0.0.1:5000/optimize_route', {
      locations: selectedStops
    });
    alert("Optimal Order: " + res.data.order.join(" -> ") + "\nDistance: " + res.data.total_distance);
  };

  return (
    <Box sx={{maxWidth: 500, mx: 'auto', mt: 10, textAlign: 'center'}}>
      <Typography variant="h4" mb={3}>Plan a new trip</Typography>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
        <TextField
          label="Where to?"
          value={query}
          onChange={handleInput}
          fullWidth
        />
        <Button onClick={() => addStop(query)} sx={{ml:1}}>+</Button>
      </Box>
      {suggestions.length > 0 && (
        <Box sx={{textAlign: 'left', border: '1px solid #ddd', borderRadius: 1, bgcolor: '#fff'}}>
          {suggestions.map((s, idx) => (
            <Box key={idx} sx={{px:2, py:1, cursor: 'pointer'}} onClick={() => addStop(s)}>{s}</Box>
          ))}
        </Box>
      )}
      <Box sx={{display:'flex', gap:2, mb:2, mt:1}}>
        <TextField
          label="Start date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dates.start || ''}
          onChange={e => setDates({...dates, start: e.target.value})}
        />
        <TextField
          label="End date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dates.end || ''}
          onChange={e => setDates({...dates, end: e.target.value})}
        />
      </Box>
      <Box sx={{mb: 2}}>
        <Typography variant="body2">Selected Stops:</Typography>
        {selectedStops.map((stop, idx) => (
          <Typography key={idx}>{stop}</Typography>
        ))}
      </Box>
      <Button variant="contained" color="error" size="large" onClick={startPlanning}>
        Start planning
      </Button>
    </Box>
  );
}
