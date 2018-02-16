import React, { Component } from 'react';
import './App.css';
import  queryString from 'query-string';

let defaultStyle = {
  color: '#fff',
  'font-family': 'helvetica'
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
      <div style={{width: '40%',
                   display: 'inline-block',
                   textAlign :'center'
            }}>
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

      <div style={{width: '40%',
                  display: 'inline-block',
                  textAlign: 'right'
            }}>
        <h2 style={defaultStyle}>
          {Math.round(totalDuration/60)} Hours</h2>
      </div>
    );
  }
}
class Filter extends Component {
  render(){
    return(
      <div style={{...defaultStyle,
                      position: 'relative',
                      width: '100%'}}>

        <input type="text" onKeyUp={event =>
             this.props.onTextChange(event.target.value)}
             style= {{position: 'relative',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      borderRadius: '5px',
                      border: '3px solid black'
                    }}/>

      </div>
    )
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return(
      <div style ={{...defaultStyle, width: "35%",
                                     minWidth: '200px',
                                     display: "inline-block",
                                     background: '#2f2525e6',
                                     padding: '26px',
                                     margin: 'auto auto 9px auto',
                                     border: '4px solid #39393980',
                                     borderRadius: '21px'

                   }}>
        <img src={playlist.imageUrl} style={{}}/>
        <h3>{playlist.name} <br></br>TOP TRACKS</h3>
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
      .then(playlistData => {
        let playlists = playlistData.items
        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: {'Authorization': 'Bearer ' + accessToken}
          })
          let trackDataPromise = responsePromise
              .then(response => response.json())
          return trackDataPromise
        })
        let allTracksDataPromises =
          Promise.all(trackDataPromises)
        let playlistsPromise = allTracksDataPromises.then(trackDatas => {
          trackDatas.forEach((trackData, i) => {
            playlists[i].trackDatas = trackData.items
            .map(item => item.track)
            .map(trackData => ({
              name: trackData.name,
              duration: trackData.duration_ms /3600
            }))
          })
          return playlists
        })
          return playlistsPromise
      })
        .then(playlists => this.setState({
          playlists: playlists.map(item => {
            console.log(item.trackDatas)
            return {
                name: item.name,
                imageUrl: item.images[0].url,
                songs: item.trackDatas.slice(0,3)
            }
              })
            }))


  };

render() {
  let playlistToRender =
   this.state.user &&
   this.state.playlists
    ? this.state.playlists.filter(playlist => {
      let matchesPlaylist = playlist.name.toLowerCase().includes(
        this.state.filterString.toLowerCase())
      let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
        .includes(this.state.filterString.toLowerCase()))
      return matchesPlaylist || matchesSong
    }) : []
  return (
    <div className="App">
      {this.state.user ?
        <div>
          <h1 style ={{...defaultStyle, fontSize:'54px',
                                        margin: '0px auto',
                                        width: '80%',
                                        padding: '24px'
                      }}>
            {this.state.user.name} and their playlists
          </h1>
          <div style = {{display: 'flex',
                         flexWrap: 'wrap'
                       }}>
                       <Filter onTextChange={text => {
                           this.setState({filterString: text})
                         }}/>
                  <PlaylistCounter playlists = {playlistToRender} />
                <HoursCounter playlists = {playlistToRender} />

                  {playlistToRender.map(playlist =>
                      <Playlist playlist={playlist}/>
                    )}
                  </div>
          </div> : <button onClick={() => {

          window.location = window.location.href.includes('localhost')
          ? 'http://localhost:8888/login'
          : 'https://react-playlist-backend.herokuapp.com/login' }
        }
          style ={{padding: '20px',
                   fontSize: '50px',
                   margin : '20px auto',
                   position: 'relative',
                   borderRadius: '13px',
                   border: '8px solid black',
                   transform: 'translateX(-50%)',
                   left: '50%'
                 }}>Sign in with Spotify</button>
      }
    </div>
  );
}
}

export default App;
