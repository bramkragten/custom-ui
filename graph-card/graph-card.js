class GraphCard extends HTMLElement {

    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
          const card = document.createElement('ha-card');
          this.content = document.createElement('div');
          this.content.className = 'card';
          this.content.style.height = this.graph_height + 'px';
          this.content.style.padding = '0px 16px 16px 16px';
          card.appendChild(this.content);
          this.appendChild(card);
          this.initGraph(this.content);
        }
    }

    initGraph(element) {
        var loading_options = {text: 'Bezig met laden...'};
    
        var _this = this;
    
        $.getScript("/local/custom-lovelace/graph-card/echarts.min.js", function(){
            _this.graph = echarts.init(element);
        	_this.graph.showLoading('default', loading_options);
        	
        	$(window).resize(function() {
		        _this.graph.resize();
	        });
        });
    
        this.initial_options = {
        	tooltip : {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    label: {
                        show: true
                    }
                }
            },
            calculable : true,
            grid: {
                top: '12%',
                left: '1%',
                right: '1%',
                containLabel: true
            },
            xAxis: [
                {
                    type : 'time',
                }
            ],
            yAxis: [
                {
                    type : 'value'
                }
            ],
            dataZoom: [
                {
                    show: true,
                    start: this.zoom,
                    end: 100
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                }
            ],
        };
    	
        /* These settings should not affect the updates and reset the zoom on each update. */
        this.update_options = {
            xAxis: [
                {
                    type : 'time',
                }
            ],
            series : []
        };

        for (const entity of this.entities) {
            console.log(entity.areaStyle);
            this.update_options.series.push({
                	smooth: entity.smooth || true,
                    name: entity.name || '',
                    type: entity.type || 'line',
                    areaStyle: entity.areaStyle || null,
                    color: entity.color || null,
                    data: null
                });
        }

    	this.getHistory();
    }

    getHistory(update) {
    	var startTime;
    	if (update) {
            startTime = this.lastEndTime;
    	} else {
            startTime = new Date();
            startTime.setHours(startTime.getHours() - this.hoursToShow);
    	}
        var endTime = new Date();
        this.lastEndTime = endTime;
        const filter = startTime.toISOString() + '?end_time=' + endTime.toISOString() + '&filter_entity_id=' + this.entity_ids.join(',');

        const prom = this._hass.callApi('GET', 'history/period/' + filter).then(
          stateHistory => this.formatData(stateHistory, update),
          () => null
        );
    }
    
    formatData(stateHistories, update) {
        var allData = [];
        
        for (const stateHistory of stateHistories)
		{
            var data = [];
            var entity_id = '';
            for (const state of stateHistory)
    		{
                if (entity_id === '') {
                    entity_id = state.entity_id;
                }
                var d = new Date(state.last_changed);
                data.push({
                    name: d.toString(),
                    value: [
                        [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') + 'T' + d.toLocaleTimeString(),
                        state.state
                    ]
                });
    		}
    		
    		allData[this.entity_ids.indexOf(entity_id)] = data;
		}
        
        if (!update) {
            this.drawGraph(allData);
        } else {
            this.updateGraph(allData);
        }
    }
    
    updateGraph(allData) {
		
	    /* Delta update. */
	    var i = 0;
	    for (const data of allData) {
    		this.update_options.series[i].data = this.update_options.series[i].data.concat(data);
	        i++;
	    }
		this.graph.setOption(this.update_options);
    }
    
    drawGraph(allData) {
        this.graph.hideLoading();
	    this.graph.setOption(this.initial_options);

        //* Different set of options, to prevent the dataZoom being reset on each update. */
	    var i = 0;
	    for (const data of allData) {
	        this.update_options.series[i].data = data;
	        i++;
	    }

		this.graph.setOption(this.update_options);
		
		var _this = this;
		
		/* Update graph data from now on. */
		setInterval(function () {
            _this.getHistory(true);
		}, this.update_interval * 1000);
        
    }
    
  setConfig(config) {
    this._config = config;
    this.title = config.title || '';
    this.hoursToShow = config.hours_to_show || 24;
    this.update_interval = config.update_interval || 30;
    this.graph_height = config.graph_height || 300;
    this.zoom = config.zoom || 0;

    this.entities = [];
    this.entity_ids = [];
    
    for (const entity of config.entities) {
      if (typeof entity == 'string') {
          this.entities.push({entity: entity});
          this.entity_ids.push(entity);
      } else {
          this.entities.push(entity);
          this.entity_ids.push(entity.entity);
      }
    }

  }
    
  getCardSize() {
    return 4;
  }
}

customElements.define('graph-card', GraphCard);