import React, { Component } from 'react';
import './App.css';
import  queryString from 'query-string';

let defaultStyle = {
  color: '#fff'
}

let fakeServerData = {
  user:{
    name: 'Austin',
    playlists: [
      {
        name: 'My favorites',
        songs: [
          {name: 'Beat It', duration: 1345},
          {name: 'Cannelloni Makaroni', duration: 1245},
          {name: 'Rosa helikoptor', duration: 5645}
        ]
      },
      {
        name: 'Discover Weekly',
        songs: [
          {name: 'GOD', duration: 1645},
          {name: 'ETHOS', duration: 2945},
          {name: 'LIL B', duration: 1545}
        ]
      },
      {
        name: 'Rap',
        songs: [
          {name: 'Lose it',duration: 4345},
          {name: 'HUMBLE', duration: 4105},
          {name: 'Black and Yellow', duration: 1305}
        ]
      },
      {
        name: 'Rock',
        songs: [
          {name:'Back in Black', duration: 2300},
          {name:'Hell\'s Bells', duration: 2303},
          {name:'Don\'t Stop', duration: 9000}
        ]
      }
    ]
  },
}
class PlaylistCounter extends Component {
  render(){
    return (
      <div style={{width: '40%', display: 'inline-block'}}>
        <h2 style={defaultStyle}>
          {this.props.playlists.length} Playlist</h2>
      </div>
    );
  }
}

class HoursCounter extends Component {
  render(){
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, [])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    return (
      <div style={{width: '40%', display: 'inline-block'}}>
        <h2 style={defaultStyle}>
          {Math.round(totalDuration/60)} Hours</h2>
      </div>
    );
  }
}
class Filter extends Component {
  render(){
    return(
      <div style={defaultStyle}>
        <img/>
        <input type="text" onKeyUp={event =>
             this.props.onTextChange(event.target.value)}/>

      </div>
    )
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return(
      <div style ={{...defaultStyle, width: "25%", display: "inline-block"}}>
        <img src={playlist.imageUrl} style={{height: '60px'}}/>
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song =>
          <li>{song.name}</li>
          )}
        </ul>
      </div>
    )
  }
}
class App extends Component
{

  constructor(){
    super()
    this.state = {
      serverData: {},
    filterString: ''
   };
  };

  componentDidMount(){
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    if (!accessToken)
      return;

    fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
      .then(data => this.setState({
        user: {
          name: data.display_name
        }
      }))

      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {'Authorization': 'Bearer ' + accessToken}
      }).then(response => response.json())
        .then(data => this.setState({
          playlists: data.items.map(item => {
            return {
                name: item.name,
                imageUrl: item.images[0].url,
                songs: []
            }
              })
            }))


  };

render() {
  let playlistToRender =
   this.state.user &&
   this.state.playlists
   ? this.state.playlists.filter(playlist =>
     playlist.name.toLowerCase().includes(
      this.state.filterString.toLowerCase()))
   : []
  return (
    <div className="App">
      {this.state.user ?
        <div>
          <h1 style ={{...defaultStyle, fontsize:'54px'}}>
            {this.state.user.name} and their playlists
          </h1>

                  <PlaylistCounter playlists = {playlistToRender} />
                <HoursCounter playlists = {playlistToRender} />
                  <Filter onTextChange={text => {
                      this.setState({filterString: text})
                    }}/>
                  {playlistToRender.map(playlist =>
                      <Playlist playlist={playlist}/>
                    )}

          </div> : <button onClick={() => {

          window.location = window.location.href.includes('localhost')
          ? 'http://localhost:8888/login'
          : 'https://react-playlist-backend.herokuapp.com/login' }
        }
          style ={{'padding': '20px', 'fontSize': '50px', 'marginTop' : '20px'}}>Sign in with Spotify</button>
      }
    </div>
  );
}
}

export default App;
