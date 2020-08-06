import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function SpotChart(props) {

  const COLORS = ['#D3D3D3', '#5BC680', '#1EBA55', '#11C680', '#16873D'];
  const renderLabel = (entry) => {
    return entry.name;
  }

  return (
    <div className="dashboard">
      <div className="container" id="slideAnimation">
        <div className="chartHolder">
          <ResponsiveContainer width="100%" height={600}>
            <PieChart height={600}>
              <Pie
                isAnimationActive={false}
                data={props.genreData.slice(0, 20)}
                labelLine={false}
                innerRadius="50%"
                outerRadius="80%"
                stroke={"#121212"}
                label={renderLabel}
                dataKey="value"
              >
                {
                  props.genreData.slice(0, 20).map((entry, index) => {
                    return <Cell key={entry.name} fill={COLORS[index % COLORS.length]} onClick={(e) => {console.log(entry.name)}}  stroke={"#121212"} />
                  })
                }
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

  )

}

export default SpotChart;
