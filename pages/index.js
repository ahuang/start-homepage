import styles from './index.css';
import data from './data.json';

export default function() {
  const renderContent = () =>{
    const blocks = data.map(d =>{
      const list = d.list.map((m,i) =>{
        if(m.icon){
          return(
            <a href={m.url} target="_blank" key={i} 
              className={styles.url} title={m.name}>
              <img src={`/icons/${m.icon}`} width="16"/>
            </a>)
        }else{
          return (
          <a href={m.url} target="_blank" key={i} className={styles.url}>
            {m.name}
          </a>)
        }
      });
      return (<div className={styles.blocks}>
        <p className={styles.title} key={d.key} style={{fontSize: '14px'}}>
          {d.title}
        </p>
        <p>{list}</p>
      </div>)

    });
    return blocks;
  }
  return (
    <div className={styles.wrap}>
      {renderContent()}
    </div>
  );
}
