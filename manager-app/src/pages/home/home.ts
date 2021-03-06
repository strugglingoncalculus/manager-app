import { AprovarPage } from './../aprovar/aprovar';
import { TransitsProvider } from './../../providers/transits-provider';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { BaseChartDirective } from '../../../node_modules/ng2-charts';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [TransitsProvider]
})
export class HomePage {
  @ViewChild("baseChart") chart: BaseChartDirective;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private _toast: ToastController,
    public _transitsProvider: TransitsProvider,
    public loadingCtrl: LoadingController) {

    this.graficoFrequencia();
    this.graficoBarreira();

    setInterval(() => { this.atualizar() }, 0.5 * 60 * 1000);
  }

  public barChartData = [];
  public lineChartData = [];
  totalAccesses = 0;
  lineChartDataMax = 0;

  graficoBarreira() {
    this._transitsProvider.todaycountbybarrier().subscribe(
      res => {
        for (var i = 0; i < res.data.length; i++) {
          this.barChartData.push({ data: [res.data[i].count], label: 'Cancela ' + res.data[i]._id })
        }

        if(this.barChartData.length > 0)
          this.createBarChart = true;
      },
      error => {
        this.handleErrorFromApiCall(error);
      })
  }

  graficoFrequencia() {
    this.totalAccesses = 0;
    this._transitsProvider.getAllByToday().subscribe(
      res => {
        console.log(res);
        this.transits = res.data;
        this.lineChartLabels = [];
        this.lineChartData = [];
        var chartData = [];
        var amountArray = [];

        for (var j = 0; j < this.transits.length; j++) {
          this.transits[j]._id.builtDate = this.buildDate(
            this.transits[j]._id.year,
            this.transits[j]._id.dayOfYear,
            this.transits[j]._id.hour,
            this.transits[j]._id.interval)

          chartData.push({ date: this.transits[j]._id.builtDate, amount: this.transits[j].count })
          this.totalAccesses += this.transits[j].count;
        }
        this.lineChartDataMax = Math.max(...chartData.map(x => x.amount));

        chartData.sort(function (a, b) {
          return a.date < b.date ? -1 : 1
        })

        for (var i = 0; i < chartData.length; i++) {
          this.lineChartLabels.push(chartData[i].date);
          amountArray.push(chartData[i].amount)
        }
        this.lineChartData.push({ data: amountArray, label: 'total' })

        if(this.lineChartData.length > 0)
          this.createChart = true;
      },
      error => {
        this.handleErrorFromApiCall(error);
      })
  }

  atualizar() {
    this.createChart = false;
    this.createBarChart = false;
    this.lineChartData = [];
    this.barChartData = [];
    this.graficoFrequencia();
    this.graficoBarreira();
  }

  logout() {
    this.navCtrl.pop();
  }

  transits = [];
  createChart = false;
  createBarChart = false;

  public lineChartLabels = [];
  public lineChartOptions: any = {
    scaleShowValues: true,
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxTicksLimit: 10
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        }
      }]
    }
  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: '#03effe',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  buildDate(year, day, hour, minutes) {
    var date = new Date(year, 0);
    date.setDate(day);
    date.setHours(hour);
    date.setHours(date.getHours() - 3)
    date.setMinutes(minutes);
    var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }
    return date.toLocaleDateString('pt-BR', options);
  }

  aprovar() {
    this.navCtrl.push(AprovarPage);
  }

  handleErrorFromApiCall(error) {
    var errorMsg = "";

    if (error.error.text) {
      errorMsg = error.error.text;
    } else {
      errorMsg = error.message;
    }

    let toast = this._toast.create({
      message: errorMsg,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;
}
